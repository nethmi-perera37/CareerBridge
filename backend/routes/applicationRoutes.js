
const express = require("express");
const mongoose = require("mongoose");

const Application = require("../models/Application");
const Internship = require("../models/Internship");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE - Student applies for an internship
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can apply for internships.",
      });
    }

    const { internshipId, coverLetter } = req.body;

    if (!mongoose.isValidObjectId(internshipId)) {
      return res.status(400).json({
        message: "Invalid internship ID.",
      });
    }

    if (
      typeof coverLetter !== "string" ||
      !coverLetter.trim() ||
      coverLetter.length > 2000
    ) {
      return res.status(400).json({
        message: "Cover letter must contain 1 to 2000 characters.",
      });
    }

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found.",
      });
    }

    if (new Date(internship.deadline) < new Date()) {
      return res.status(400).json({
        message: "The application deadline has passed.",
      });
    }

    const existingApplication = await Application.findOne({
      internship: internshipId,
      student: req.user._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied for this internship.",
      });
    }

    const application = await Application.create({
      internship: internshipId,
      student: req.user._id,
      coverLetter: coverLetter.trim(),
    });

    res.status(201).json({
      message: "Application submitted successfully!",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this internship.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to submit application.",
    });
  }
});

// READ - Student views their own applications
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view their applications.",
      });
    }

    const applications = await Application.find({
      student: req.user._id,
    })
      .populate("internship", "title company location type deadline")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applications.",
    });
  }
});

// READ - Company views applications for its internship
router.get("/internship/:internshipId", protect, async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "Only companies can view applicants.",
      });
    }

    const { internshipId } = req.params;

    if (!mongoose.isValidObjectId(internshipId)) {
      return res.status(400).json({
        message: "Invalid internship ID.",
      });
    }

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found.",
      });
    }

    if (
      !internship.postedBy ||
      internship.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can only view applicants for your internships.",
      });
    }

    const applications = await Application.find({
      internship: internshipId,
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch applicants.",
    });
  }
});

// UPDATE - Company accepts or rejects an application
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "Only companies can update application status.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid application ID.",
      });
    }

    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Accepted or Rejected.",
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const internship = await Internship.findById(
      application.internship
    );

    if (
      !internship ||
      !internship.postedBy ||
      internship.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You cannot manage this application.",
      });
    }

    // Atomic conditional update: a decision can only be made while Pending.
    // This also prevents two simultaneous requests from changing a final decision.
    const updatedApplication = await Application.findOneAndUpdate(
      { _id: application._id, status: "Pending" },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(409).json({
        message: "This application has already been accepted or rejected. The decision is final.",
      });
    }

    res.json({
      message: "Application status updated successfully.",
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update application status.",
    });
  }
});

module.exports = router;

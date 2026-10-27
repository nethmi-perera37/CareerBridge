
const express = require("express");
const mongoose = require("mongoose");
const Internship = require("../models/Internship");
const { protect, companyOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE - Only logged-in companies can post internships
router.post("/", protect, companyOnly, async (req, res) => {
  try {
    const {
      title,
      location,
      type,
      description,
      requirements,
      deadline,
    } = req.body;

    const internship = await Internship.create({
      title,
      company: req.user.name,
      location,
      type,
      description,
      requirements,
      deadline,
      postedBy: req.user._id,
    });

    res.status(201).json(internship);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create internship.",
    });
  }
});

// READ - Everyone can view internships
router.get("/", async (req, res) => {
  try {
    const internships = await Internship.find().sort({
      createdAt: -1,
    });

    res.json(internships);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch internships.",
    });
  }
});

// READ - Everyone can view internship details
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid internship ID.",
      });
    }

    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found.",
      });
    }

    res.json(internship);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch internship.",
    });
  }
});

// UPDATE - Only the company that posted it can edit
router.put("/:id", protect, companyOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid internship ID.",
      });
    }

    const internship = await Internship.findById(req.params.id);

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
        message: "You can only edit internships posted by your company.",
      });
    }

    const allowedFields = [
      "title",
      "location",
      "type",
      "description",
      "requirements",
      "deadline",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        internship[field] = req.body[field];
      }
    }

    await internship.save();

    res.json(internship);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update internship.",
    });
  }
});

// DELETE - Only the company that posted it can delete
router.delete("/:id", protect, companyOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid internship ID.",
      });
    }

    const internship = await Internship.findById(req.params.id);

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
        message: "You can only delete internships posted by your company.",
      });
    }

    await internship.deleteOne();

    res.json({
      message: "Internship deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete internship.",
    });
  }
});

module.exports = router;

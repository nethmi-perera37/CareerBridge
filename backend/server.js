const dns = require("dns");
dns.setServers(["8.8.8.8"]);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const internshipRoutes = require("./routes/internshipRoutes");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/internships", internshipRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    message: "CareerBridge backend is working!",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected"
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`CareerBridge backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
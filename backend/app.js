const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Serve static files
app.use("/assets", express.static(path.join(__dirname, "../frontend/assets")));
app.use("/css", express.static(path.join(__dirname, "../frontend/css")));
app.use("/js", express.static(path.join(__dirname, "../frontend/js")));

// API Routes
app.use("/api/users", userRouter);

// HTML Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/views/login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/views/login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/views/sign_up.html"));
});

app.get("/success", (req, res) => {
  console.log("Accessing success route");
  const filePath = path.join(__dirname, "../frontend/views/success.html");
  console.log("Success file path:", filePath);
  res.sendFile(filePath);
});

// Handle 404
app.all("*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend/views/404.html"));
});

module.exports = app;

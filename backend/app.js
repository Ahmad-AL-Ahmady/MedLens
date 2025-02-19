const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
require("./config/passport");

const userRouter = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev")); // This will log all requests
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(passport.initialize());

// Serve static files - Add this line
app.use("/public", express.static(path.join(__dirname, "public")));

// Debug route to test base URL
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/users", userRouter);

// Debug 404 handler
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const passport = require("passport");
require("./config/passport");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(passport.initialize());

// API Routes
app.use("/api/users", userRouter);

module.exports = app;

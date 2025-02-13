const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      userType: req.body.userType,
      location: req.body.location,
      gender: req.body.gender,
      age: req.body.age,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.googleLogin = passport.authenticate("google", {
  session: false, // Disable sessions for JWT
});

exports.googleCallback = (req, res) => {
  // Successful authentication, generate JWT
  const token = signToken(req.user._id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: req.user,
    },
  });
};

// Handle authentication errors
exports.googleAuthFailure = (req, res) => {
  res.status(401).json({
    status: "fail",
    message: "Google authentication failed",
  });
};

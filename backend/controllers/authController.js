const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
      profileCompleted: user.profileCompleted,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    userType: req.body.userType,
    provider: "local",
    profileCompleted: false,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password +provider");

  if (!user || user.provider === "google") {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.googleLogin = (req, res, next) => {
  console.log("Starting Google authentication process");
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  console.log("Received Google callback", req.url);

  passport.authenticate("google", { session: false }, (err, user, info) => {
    console.log("Inside passport.authenticate callback");

    if (err) {
      console.error("Google Auth Error:", err);
      return next(new AppError(`Authentication error: ${err.message}`, 500));
    }

    if (!user) {
      console.error("No user returned", info);
      return next(
        new AppError("Authentication failed - no user returned", 401)
      );
    }

    console.log("Authentication successful, creating token");
    try {
      createSendToken(user, 200, res);
    } catch (error) {
      console.error("Token creation error:", error);
      return next(new AppError("Error creating authentication token", 500));
    }
  })(req, res, next);
};

exports.googleAuthFailure = (req, res) => {
  console.log("Google authentication failed");
  res.status(401).json({
    status: "fail",
    message: "Google authentication failed",
  });
};

exports.completeProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update user profile
  user.gender = req.body.gender;
  user.age = req.body.age;

  // Only set location if user is Doctor or Pharmacy
  if (user.userType === "Doctor" || user.userType === "Pharmacy") {
    if (!req.body.location) {
      return next(
        new AppError("Please provide location for Doctor/Pharmacy", 400)
      );
    }
    user.location = req.body.location;
  }

  user.profileCompleted = true;
  await user.save();

  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+provider"
  );

  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  if (user.provider === "google") {
    return next(new AppError("This account uses Google authentication", 400));
  }

  const otp = user.createPasswordResetOTP();
  await user.save({ validateBeforeSave: false });

  try {
    const message = `Your password reset OTP is: ${otp}\nValid for 10 minutes only.`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset OTP (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent to email!",
    });
  } catch (err) {
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    passwordResetOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("OTP is invalid or has expired", 400));
  }

  if (!user.verifyOTP(otp)) {
    return next(new AppError("Invalid OTP", 400));
  }

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({
    email,
    passwordResetOTPExpires: { $gt: Date.now() },
  }).select("+provider");

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  if (user.provider === "google") {
    return next(new AppError("This account uses Google authentication", 400));
  }

  if (!user.verifyOTP(otp)) {
    return next(new AppError("Invalid OTP", 400));
  }

  user.password = password;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

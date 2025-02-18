const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Helper function to send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationURL = `${process.env.BASE_URL}/users/verifyEmail/${verificationToken}`;
  // http://localhost:4000/api/users/verifyEmail/token

  const message = `
    <div style="background-color: #f9fafb; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background-color: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 20px;">Verify Your Email Address</h2>
        <p style="color: #3a2d34; text-align: center; font-size: 16px;">Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationURL}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #3a2d34; font-size: 14px; text-align: center; margin-bottom: 20px;">This link will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">If you didn't create an account, please ignore this email.</p>
      </div>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: "Please verify your email address",
    message,
  });
};

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // 1) Hash token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2) Find user with matching token that hasn't expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired verification link", 400));
  }

  // 3) Update user
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 4) Log the user in automatically after verification
  createSendToken(user, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  // 1) Create user
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.password,
    userType: req.body.userType,
    profileCompleted: false,
    emailVerified: false,
    age: req.body.age,
    gender: req.body.gender,
    location: req.body.location
      ? req.body.userType == ("Doctor" || "Pharmacy")
      : null,
  });

  // 2) Generate verification token
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // 3) Send verification email
  await sendVerificationEmail(newUser, verificationToken);

  // 4) Send response
  res.status(201).json({
    status: "success",
    message: "User created, please verify your email address",
    data: {
      user: newUser,
    },
  });
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

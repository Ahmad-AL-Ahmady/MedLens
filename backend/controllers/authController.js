const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
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
  user.profileCompleted = true;
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 4) Send HTML response with auto-close script
  const subMessage = `
  <div style="padding: 20px;">
    <div style="background-color: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: 40px auto; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 20px;">Email Verified Successfully!</h2>
      <p style="color: #3a2d34; text-align: center; font-size: 16px;">Your email has been verified.</p>
      <p style="color: #3a2d34; font-size: 14px; text-align: center; margin-bottom: 20px;">You can now close this window and continue using the application.</p>
    </div>
  </div>
`;

  res.send(`
  <html>
    <head>
      <title>Email Verification Success</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
      <div style="padding: 20px;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: 40px auto; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 20px;">Email Verified Successfully!</h2>
          <p style="color: #3a2d34; text-align: center; font-size: 16px;">Your email has been verified successfully.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              <svg style="width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verification Complete
            </div>
          </div>
          <p style="color: #3a2d34; font-size: 14px; text-align: center; margin-bottom: 20px;">This window will close automatically in a few seconds.</p>
          <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">You can now close this window and continue using the application.</p>
        </div>
      </div>
      <script>
        setTimeout(() => {
          window.close();
          // Check if window is still open after a brief delay
          setTimeout(() => {
            if (!window.closed) {
              document.body.innerHTML = \`${subMessage}\`;
            }
          }, 300);
        }, 10000);
      </script>
    </body>
  </html>
`);
});

exports.signup = catchAsync(async (req, res, next) => {
  // 1) Prepare user data with correct conditional fields
  const userData = {
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
  };

  // Add location for Doctor or Pharmacy
  if (req.body.userType === "Doctor" || req.body.userType === "Pharmacy") {
    if (req.body.location && req.body.location.coordinates) {
      userData.location = {
        type: "Point",
        coordinates: req.body.location.coordinates,
      };
    }
  }

  // Add specialization for Doctor
  if (req.body.userType === "Doctor" && req.body.specialization) {
    userData.specialization = req.body.specialization;
  }

  // 2) Create user
  const newUser = await User.create(userData);

  // 3) Generate verification token
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // 4) Send verification email
  await sendVerificationEmail(newUser, verificationToken);

  // 5) Send response
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

  // 1) Check if email and password are provided
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Find user and include emailVerified status in selection
  const user = await User.findOne({ email })
    .select("+password")
    .select("firstName lastName email userType avatar emailVerified");

  // 3) Check if user exists and password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 4) Check if email is verified
  if (!user.emailVerified) {
    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send new verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      return next(
        new AppError(
          "Please verify your email first. A new verification link has been sent to your email.",
          401
        )
      );
    } catch (err) {
      // If email sending fails, clear the verification tokens
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "Error sending verification email. Please try again later.",
          500
        )
      );
    }
  }

  // 5) Send token and log in user
  createSendToken(user, 200, req, res);
  console.log(`User logged in: ${user.email}`);
});

exports.googleLogin = async (req, res) => {
  // This URL is where we'll redirect the user after successful authentication
  const { frontendUrl } = req.query;

  // Validate that frontendUrl is provided
  // This is crucial for knowing where to redirect after auth
  if (!frontendUrl) {
    return res.status(400).json({
      status: "error",
      message: "Frontend URL is required",
    });
  }

  try {
    // Initialize Google authentication using Passport
    passport.authenticate("google", {
      // Specify what data we want from Google
      scope: ["profile", "email"],

      // Security feature to prevent CSRF attacks and where to redirect the user after authentication
      state: Buffer.from(JSON.stringify({ frontendUrl })).toString("base64"),
    })(req, res);
  } catch (error) {
    // Log any errors that occur during authentication
    console.error("Google auth error:", error);

    // Send error response to client
    return res.status(500).json({
      status: "error",
      message: "Error during Google authentication",
    });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "firstName lastName email userType avatar emailVerified"
    );

    // If email not verified, send verification email
    if (!user.emailVerified) {
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
      await sendVerificationEmail(user, verificationToken);
    }
    console.log("User data:", user);

    // Get the state from Google's response
    const { state } = req.query;

    // Decode the frontendUrl from state
    const { frontendUrl } = JSON.parse(Buffer.from(state, "base64").toString());

    // Create and send token
    const token = signToken(req.user._id);
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    // If profile is not completed, redirect to complete profile page
    if (!user.profileCompleted) {
      res.redirect(`${frontendUrl}/complete-profile?token=${token}`);
    } else {
      // If profile is completed, redirect to dashboard
      res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    }
  } catch (error) {
    const frontendUrl = req.query.state
      ? // Frontend URL: http://localhost:3000
        JSON.parse(Buffer.from(req.query.state, "base64").toString())
          .frontendUrl
      : process.env.BASE_URL;
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.query.token) {
    // This checks for query parameter
    token = req.query.token;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again", 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.completeProfile = catchAsync(async (req, res, next) => {
  // 1) Get user and include necessary fields
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // 2) Validate required fields
  if (!req.body.gender || !req.body.age) {
    return next(new AppError("Please provide gender and age", 400));
  }

  // 3) Update user fields
  const updateData = {
    gender: req.body.gender,
    age: req.body.age,
    profileCompleted: true,
  };

  // 4) Update the user using findByIdAndUpdate to skip validation
  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true, // Return updated document
    runValidators: false, // Skip validation
  });

  // 5) Send response
  createSendToken(updatedUser, 200, req, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  // 2) Generate random OTP
  const otp = user.createPasswordResetOTP();
  // console.log("Generated OTP:", otp); // Debug log

  await user.save({ validateBeforeSave: false });

  // Debug log - verify the saved data
  // console.log("Saved user OTP data:", {
  //   hashedOTP: user.passwordResetOTP,
  //   expiryTime: user.passwordResetOTPExpires,
  //   currentTime: new Date(),
  // });

  // 3) Send it to user's email
  const message = `
    <div style="background-color: #f6f9fc; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background-color: white; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 20px;">Password Reset Code</h2>
        <p style="color: #3a2d34; text-align: center; font-size: 16px;">You requested a password reset. Use the code below to reset your password:</p>
        <div style="background-color: #2563eb; padding: 15px; margin: 20px auto; text-align: center; border-radius: 5px; font-size: 18px; font-weight: bold; color: #fff; width: fit-content;">
          ${otp}
        </div>
        <p style="color: #3a2d34; font-size: 14px; text-align: center; margin-bottom: 20px;">This code is valid for 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code",
      message,
      html: message,
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

  // console.log("Verifying OTP:", { email, otp });

  if (!email || !otp) {
    return next(new AppError("Please provide email and OTP", 400));
  }

  // Find user with unexpired OTP
  const user = await User.findOne({ email }).select(
    "+passwordResetOTP +passwordResetOTPExpires"
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Verify OTP
  const isValid = user.verifyOTP(otp);
  if (!isValid) {
    return next(new AppError("Invalid OTP", 400));
  }

  // Use the model method to create reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // console.log("Debug verifyOTP:", {
  //   plainToken: resetToken,
  //   hashedTokenInDB: user.passwordResetToken,
  // });

  // Clear OTP fields
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;

  await user.save({ validateBeforeSave: false });

  // Send plain token in cookie
  res.cookie("passwordResetToken", resetToken, {
    expires: new Date(Date.now() + 10 * 60 * 1000),
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const resetToken = req.cookies.passwordResetToken;

  // console.log("Reset Password Debug:", {
  //   receivedToken: resetToken,
  //   cookieHeader: req.headers.cookie,
  // });

  if (!resetToken) {
    return next(new AppError("Reset session has expired or is invalid", 400));
  }

  // Hash token using same method as in model
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log("Token Comparison:", {
  //   receivedToken: resetToken,
  //   hashedTokenForSearch: hashedToken,
  // });

  // Find user with token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  // console.log("User Search Result:", {
  //   userFound: !!user,
  //   hashedTokenUsedForSearch: hashedToken,
  // });

  if (!user) {
    return next(new AppError("Reset session has expired or is invalid", 400));
  }

  // Update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // Clear passwordResetToken cookie
  res.cookie("passwordResetToken", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  // Log user in
  createSendToken(user, 200, req, res);
});

exports.verifyResetSession = catchAsync(async (req, res, next) => {
  const resetToken = req.cookies.passwordResetToken;

  if (!resetToken) {
    return next(new AppError("Reset session has expired or is invalid", 400));
  }

  // Hash token from cookie
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find user with matching hashed token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Reset session has expired or is invalid", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Valid reset session",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user info
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({ status: "success" });
};

const User = require("../models/userModel");
const PatientProfile = require("../models/patientProfileModel");
const catchAsync = require("../utils/catchAsync");

exports.testProfileCreation = catchAsync(async (req, res, next) => {
  // Get current user
  const user = await User.findById(req.user.id);

  // Find the profile
  let profile;
  if (user.userType === "Patient") {
    profile = await PatientProfile.findOne({ user: user._id });
  }
  // Add other profile types here as needed

  res.status(200).json({
    status: "success",
    data: {
      user,
      profile,
      profileExists: !!profile,
    },
  });
});

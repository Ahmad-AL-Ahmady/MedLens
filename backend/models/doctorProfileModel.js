const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    experience: Number, // Years of experience
    hospital: String,
    biography: {
      type: String,
      trim: true,
    },
    fees: {
      type: Number,
      min: 0,
    },
    availability: {
      monday: { start: String, end: String, isAvailable: Boolean },
      tuesday: { start: String, end: String, isAvailable: Boolean },
      wednesday: { start: String, end: String, isAvailable: Boolean },
      thursday: { start: String, end: String, isAvailable: Boolean },
      friday: { start: String, end: String, isAvailable: Boolean },
      saturday: { start: String, end: String, isAvailable: Boolean },
      sunday: { start: String, end: String, isAvailable: Boolean },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for appointments
doctorProfileSchema.virtual("appointments", {
  ref: "Appointment",
  foreignField: "doctor",
  localField: "user",
});

// Virtual populate for reviews
doctorProfileSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "reviewedEntity",
  localField: "user",
});

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);

module.exports = DoctorProfile;

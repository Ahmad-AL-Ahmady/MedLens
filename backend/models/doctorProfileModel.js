const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    start: {
      type: String,
      validate: {
        validator: function (v) {
          // Time format validation (HH:MM)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:MM`,
      },
    },
    end: {
      type: String,
      validate: {
        validator: function (v) {
          // Time format validation (HH:MM)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:MM`,
      },
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    biography: {
      type: String,
      trim: true,
    },
    fees: {
      type: Number,
      min: 0,
    },
    availability: {
      monday: { type: availabilitySchema, default: () => ({}) },
      tuesday: { type: availabilitySchema, default: () => ({}) },
      wednesday: { type: availabilitySchema, default: () => ({}) },
      thursday: { type: availabilitySchema, default: () => ({}) },
      friday: { type: availabilitySchema, default: () => ({}) },
      saturday: { type: availabilitySchema, default: () => ({}) },
      sunday: { type: availabilitySchema, default: () => ({}) },
    },
    // New fields for enhanced location information
    locationName: {
      type: String,
      trim: true,
    },
    formattedAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
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

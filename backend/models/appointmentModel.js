const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    // status: {
    //   type: String,
    //   enum: ["scheduled", "confirmed", "cancelled", "completed"],
    //   default: "scheduled",
    // },
    // reason: String,
    // notes: String,
  },
  {
    timestamps: true,
  }
);

// Add index to help query appointments efficiently
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

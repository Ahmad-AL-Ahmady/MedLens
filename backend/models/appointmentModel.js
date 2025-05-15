/**
 * appointmentModel.js
 *
 * This file defines the Mongoose schema for the Appointment model in the HealthVision backend.
 * It includes fields for appointment details such as patient, doctor, date, time, status, and notes.
 */

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
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason cannot be more than 500 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot be more than 1000 characters"],
    },
    patientNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Patient notes cannot be more than 500 characters"],
    },
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Doctor notes cannot be more than 500 characters"],
    },
    isFirstVisit: {
      type: Boolean,
      default: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add index to help query appointments efficiently
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

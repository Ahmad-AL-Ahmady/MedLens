const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * GET /api/appointments/available-slots/:doctorId/:date
 * Frontend: Used in appointment booking flow to show available time slots
 * Displays all available 30-minute slots for a specific doctor on the chosen date
 * Shows which slots are free and which are already booked
 * Used in the "Select Time" step of appointment booking
 */
router.get(
  "/available-slots/:doctorId/:date",
  appointmentController.getAvailableTimeSlots
);

// All other routes require authentication
router.use(authController.protect);

/**
 * GET /api/appointments/my-appointments
 * Frontend: Used to display list of user's appointments in patient/doctor dashboard
 * Parameters: status (pending/confirmed/cancelled/completed), pastOrUpcoming (past/upcoming)
 * For patients: Shows all their booked appointments with different doctors
 * For doctors: Shows all appointments that patients have booked with them
 * Used in the "My Appointments" section of user dashboard
 */
router.get("/my-appointments", appointmentController.getMyAppointments);

/**
 * POST /api/appointments/book
 * Frontend: Used to create a new appointment booking
 * Takes doctor ID, date, time slot, and reason/notes from patient
 * Only available to patients (not doctors or admins)
 * Used in the final step of the appointment booking process
 */
router.post(
  "/book",
  authController.restrictTo("Patient"),
  appointmentController.createAppointment
);

/**
 * GET /api/appointments/doctor-schedule/:doctorId
 * Frontend: Used to view a doctor's complete schedule for a time period
 * Parameters: startDate, endDate (optional, defaults to next 7 days)
 * Used by doctors to view their upcoming appointments
 * Also used by admin to manage doctor schedules
 */
router.get(
  "/doctor-schedule/:doctorId",
  appointmentController.getDoctorSchedule
);

/**
 * GET /api/appointments/:id
 * Frontend: Used to view details of a specific appointment
 * Shows complete appointment information including patient/doctor details
 * Used when user clicks on an appointment in their list
 * Used in appointment detail page/modal
 */
router
  .route("/:id")
  .get(appointmentController.getAppointment)
  /**
   * PATCH /api/appointments/:id
   * Frontend: Used to update appointment status
   * For doctors: Confirm appointments or mark as completed
   * For admins: Update any appointment status
   * Used in appointment management interface
   */
  .patch(appointmentController.updateAppointmentStatus)
  /**
   * DELETE /api/appointments/:id
   * Frontend: Used to cancel and delete a booked appointment
   * Available to both patients and doctors
   * Completely removes the appointment from the database
   * Used in appointment detail view for the cancel action
   */
  .delete(appointmentController.cancelAppointment);

module.exports = router;

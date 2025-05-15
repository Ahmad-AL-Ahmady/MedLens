/**
 * appError.js
 *
 * This file defines a custom error class for the HealthVision backend.
 * The AppError class extends the built-in Error class to provide additional
 * functionality for handling operational errors in the application.
 * It includes properties for status code, status type, and operational status.
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // TO BE USED LATER

    Error.captureStackTrace(this, this.constructor); // Error.captureStackTrace(CURRENT OBJECT, APP ERROR CLASS ITSELF: "CONSTRUCTOR")
  }
}

module.exports = AppError;

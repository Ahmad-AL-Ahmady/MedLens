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

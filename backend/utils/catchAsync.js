/**
 * catchAsync.js
 *
 * This file provides a utility function for handling asynchronous errors in Express routes.
 * It wraps async route handlers to automatically catch and forward errors to Express's error handling middleware.
 * This eliminates the need for try-catch blocks in route handlers.
 */

module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);

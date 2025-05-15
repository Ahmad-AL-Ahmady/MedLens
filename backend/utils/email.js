/**
 * email.js
 *
 * This file provides email functionality for the HealthVision backend using Nodemailer.
 * It configures a Gmail SMTP transporter and provides a function to send emails.
 * The email service is used for notifications, verification, and password reset functionality.
 *
 * Configuration:
 * - Uses Gmail SMTP server
 * - Requires Gmail username and app password from environment variables
 * - Supports HTML email templates
 */

const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create Gmail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_APP_PASSWORD, // App Password from Google Account
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Email options with HTML template
  const mailOptions = {
    from: {
      name: "MedLens",
      address: process.env.GMAIL_USERNAME,
    },
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${options.email}`);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("There was an error sending the email. Try again later.");
  }
};

module.exports = sendEmail;

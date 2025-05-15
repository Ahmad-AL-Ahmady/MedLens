# MedLens Backend Controllers Documentation

This document provides a comprehensive overview of the controllers in the MedLens backend system. Each controller is responsible for handling specific functionality and managing different aspects of the application.

## Table of Contents

- [Authentication Controller](#authentication-controller)
- [User Controller](#user-controller)
- [Profile Controller](#profile-controller)
- [Appointment Controller](#appointment-controller)
- [Doctor Controller](#doctor-controller)
- [Medical Scan Controller](#medical-scan-controller)
- [Review Controller](#review-controller)
- [Medication Controller](#medication-controller)
- [Pharmacy Controller](#pharmacy-controller)
- [Patient Controller](#patient-controller)

## Authentication Controller

**File:** `authController.js`

Handles all authentication-related functionality including:

- User registration and login
- JWT token generation and management
- Password reset functionality
- Google OAuth authentication
- Account deletion
- Session management

## User Controller

**File:** `userController.js`

Manages user profile operations including:

- Retrieving current user profile
- Updating user information
- Account deactivation
- Avatar management
- Data consistency across user profiles

## Profile Controller

**File:** `profileController.js`

Handles profile management for different user types:

- Patient profiles with medical history
- Doctor profiles with availability
- Pharmacy profiles with inventory
- Automatic profile creation
- Data validation
- Related data population

## Appointment Controller

**File:** `appointmentController.js`

Manages appointment scheduling and tracking:

- Getting available time slots
- Creating and updating appointments
- Canceling appointments
- Viewing appointment history
- Validations for doctor availability
- Time slot conflict prevention

## Doctor Controller

**File:** `doctorController.js`

Handles doctor-specific functionality:

- Managing doctor profiles
- Availability management
- Location information
- Appointment history
- Review management
- Professional information

## Medical Scan Controller

**File:** `medicalScanController.js`

Manages medical scan functionality:

- Uploading and storing scan images
- AI-powered scan analysis
- Viewing and managing scan history
- Filtering scans by body part and date
- Secure file handling
- Integration with AI service

## Review Controller

**File:** `reviewController.js`

Handles review management:

- Creating reviews for doctors and pharmacies
- Viewing entity reviews
- Managing user reviews
- Marking reviews as helpful
- Rating validation
- Duplicate review prevention

## Medication Controller

**File:** `medicationController.js`

Manages medication-related operations:

- Creating and managing medication records
- Searching medications
- Finding pharmacies with specific medications
- Tracking medication inventory
- Location-based pharmacy search
- Duplicate medication prevention

## Pharmacy Controller

**File:** `pharmacyController.js`

Handles pharmacy management:

- Managing pharmacy profiles
- Inventory management
- Location and address information
- Operating hours
- Medication orders
- Review management
- Geocoding integration

## Patient Controller

**File:** `patientController.js`

Manages patient-specific functionality:

- Patient profile management
- Appointment history
- Dashboard data
- Medical history tracking
- Personal information management
- Appointment statistics

## Common Features Across Controllers

All controllers implement:

- Error handling using `catchAsync` wrapper
- Input validation
- Authorization checks
- Proper HTTP status codes
- Consistent response format
- Pagination where applicable
- Data population for related entities

## Response Format

All controllers follow a consistent response format:

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

For paginated responses:

```json
{
  "status": "success",
  "results": number,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  },
  "data": {
    // Response data
  }
}
```

## Error Handling

All controllers use the `AppError` class for error handling, providing:

- Consistent error format
- Appropriate HTTP status codes
- Descriptive error messages
- Proper error propagation

## Security Features

Controllers implement various security measures:

- Input sanitization
- Authorization checks
- Rate limiting
- Data validation
- Secure file handling
- Protected routes

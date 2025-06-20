# 🏥 MedLens - AI-Powered Healthcare Platform

<div align="center">

![MedLens Logo](frontend/src/assets/images/Whitelogo.png)

**Revolutionizing Healthcare with Artificial Intelligence**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.10.1-orange.svg)](https://tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103.1-teal.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-blue.svg)](https://mongodb.com/)

_A comprehensive healthcare platform that combines advanced AI-powered medical diagnostics, clinic management, and pharmacy services._

</div>

---

## 📋 Table of Contents

- [🚀 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🤖 AI-Powered Medical Analysis](#-ai-powered-medical-analysis)
- [👥 User Roles & Dashboards](#-user-roles--dashboards)
- [🛠️ Technology Stack](#️-technology-stack)
- [⚛️ Frontend Implementation](#️-frontend-implementation)
- [📦 Installation & Setup](#-installation--setup)
- [🚀 Running the Application](#-running-the-application)
- [📁 Project Structure](#-project-structure)
- [🔧 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [👨‍💻 Development Team](#-development-team)
- [📄 License](#-license)

---

## 🚀 Overview

**MedLens** is a cutting-edge healthcare platform that revolutionizes medical diagnostics and healthcare management through the power of artificial intelligence. The platform serves three main user types: **Patients**, **Doctors**, and **Pharmacies**, providing a comprehensive ecosystem for modern healthcare delivery.

### 🎯 Mission

To democratize access to advanced medical diagnostics and streamline healthcare services through AI-powered solutions, making quality healthcare more accessible, efficient, and accurate.

### 🌟 Vision

To become the leading AI-powered healthcare platform that bridges the gap between patients, healthcare providers, and pharmaceutical services, ultimately improving health outcomes globally.

---

## ✨ Key Features

### 🔬 **AI-Powered Medical Image Analysis**

- **8 Specialized AI Models** for different body parts and conditions
- **Real-time X-ray Analysis** with 90-97% accuracy rates
- **Multi-body Part Support**: Chest, Brain, Eye, Bones, Lung, Kidney, Skin, Nails
- **Intelligent Chat System** for medical consultations
- **Automated Medical Report Generation**

### 🏥 **Comprehensive Healthcare Management**

- **Patient Dashboard**: Medical history, appointments, scan results
- **Doctor Dashboard**: Patient management, appointment scheduling, scan reviews
- **Pharmacy Dashboard**: Inventory management, medication tracking
- **Appointment System**: Real-time scheduling with availability management
- **Location-based Services**: Find nearby doctors and pharmacies

### 🔐 **Security & Authentication**

- **JWT-based Authentication** with secure token management
- **Google OAuth Integration** for seamless login
- **Role-based Access Control** (Patient, Doctor, Pharmacy)
- **Secure File Upload** with image processing and validation
- **HIPAA-compliant** data handling practices

### 📱 **Modern User Interface**

- **Responsive Design** optimized for all devices
- **Interactive Maps** using Leaflet for location services
- **Real-time Notifications** and alerts
- **Intuitive Navigation** with role-specific dashboards
- **Professional Medical UI** with accessibility features

---

## 🏗️ System Architecture

### **Multi-Service Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │  FastAPI AI Service │
│   (Port 3000)   │◄──►│   (Port 4000)   │◄──►│   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   MongoDB DB    │    │   AI Models     │
│   & Public Files│    │   (User Data)   │    │   (TensorFlow)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow Architecture**

1. **Frontend Layer**: React.js with Redux state management
2. **API Gateway**: Express.js backend with RESTful APIs
3. **AI Processing**: FastAPI service with TensorFlow models
4. **Data Persistence**: MongoDB with Mongoose ODM
5. **File Storage**: Local file system with image processing

---

## 🤖 AI-Powered Medical Analysis

### **Advanced AI Model Suite**

The platform features **8 specialized AI models** trained on extensive medical datasets:

#### 🫁 **Chest X-Ray Analysis** (95% Accuracy)

- **9 Conditions Detected**:
  - Air Embolism Conditions
  - Chronic Obstructive Pulmonary Disease
  - Encapsulated Lesions
  - Mediastinal Disorders
  - Normal Anatomy
  - Pleural Pathologies
  - Pneumonia
  - Pulmonary Fibrotic Conditions
  - Thoracic Abnormalities

#### 👁️ **Eye Disease Detection** (91% Accuracy)

- **8 Conditions Detected**:
  - Age-related Macular Degeneration
  - Choroidal Neovascularization
  - Central Serous Retinopathy
  - Diabetic Macular Edema
  - Diabetic Retinopathy
  - DRUSEN
  - Macular Hole
  - Normal Eye

#### 🧠 **Brain Tumor Detection** (92% Accuracy)

- **4 Tumor Types**:
  - Glioma
  - Meningioma
  - Normal Brain
  - Pituitary Tumor

#### 🦴 **Bone Fracture Analysis** (97% Accuracy)

- **10 Fracture Types**:
  - Avulsion Fracture
  - Comminuted Fracture
  - Fracture Dislocation
  - Greenstick Fracture
  - Hairline Fracture
  - Impacted Fracture
  - Longitudinal Fracture
  - Oblique Fracture
  - Pathological Fracture
  - Spiral Fracture

#### 🫀 **Additional Specialized Models**

- **Lung Cancer Detection** (93% Accuracy): Benign/Malignant/Normal
- **Kidney Analysis** (90% Accuracy): Normal/Tumor detection
- **Skin Cancer Detection** (92% Accuracy): Benign/Malignant classification
- **Nail Condition Analysis** (89% Accuracy): Healthy/Onychomycosis/Psoriasis

### **AI Processing Pipeline**

```
1. Image Upload → 2. Preprocessing → 3. Primary Validation → 4. Body Part Detection
         ↓              ↓                ↓                    ↓
    File Upload    Resize to 224x224   X-ray Validation   Model Selection
         ↓              ↓                ↓                    ↓
5. Specialized Analysis → 6. Confidence Assessment → 7. Medical Report Generation
         ↓                        ↓                        ↓
   AI Model Inference        Accuracy Scoring         Automated Content
         ↓                        ↓                        ↓
8. Result Presentation → 9. Chat Integration → 10. Database Storage
         ↓                        ↓                        ↓
   User Interface           Medical Q&A              Patient Records
```

### **Intelligent Chat System**

- **Context-Aware Responses** based on current diagnosis
- **Multilingual Support** (English & Arabic)
- **Medical Information Retrieval** from diagnosis results
- **Natural Language Processing** for medical consultations
- **Automated Medical Content Generation**

---

## 👥 User Roles & Dashboards

### **👤 Patient Dashboard**

- **Medical History Management**: Track all medical records and scan results
- **Appointment Scheduling**: Book, reschedule, and cancel appointments
- **Scan Results**: View AI analysis results with detailed medical reports
- **Doctor Discovery**: Find and book appointments with nearby doctors
- **Pharmacy Services**: Locate pharmacies and check medication availability
- **Profile Management**: Update personal information and medical details

### **👨‍⚕️ Doctor Dashboard**

- **Patient Management**: View patient profiles and medical histories
- **Appointment Management**: Manage schedule and patient appointments
- **Scan Review**: Review AI-generated scan results and provide expert analysis
- **Availability Settings**: Set working hours and availability
- **Patient Communication**: Direct messaging and consultation tools
- **Professional Profile**: Manage credentials, specializations, and reviews

### **💊 Pharmacy Dashboard**

- **Inventory Management**: Track medication stock and availability
- **Order Processing**: Manage medication orders and prescriptions
- **Patient Services**: Assist patients with medication queries
- **Location Management**: Update pharmacy location and operating hours
- **Medication Database**: Comprehensive medication information system
- **Profile Management**: Update pharmacy information and services

---

## 🛠️ Technology Stack

### **Frontend Technologies**

```json
{
  "React": "18.2.0",
  "React Router": "6.29.0",
  "Leaflet": "1.9.4",
  "React Leaflet": "4.2.1",
  "Axios": "1.7.9",
  "SweetAlert2": "11.19.1",
  "Lucide React": "0.475.0",
  "React Simple Star Rating": "5.1.7",
  "React Icons": "5.4.0",
  "Date-fns": "4.1.0"
}
```

### **Backend Technologies**

```json
{
  "Node.js": "Express Framework",
  "MongoDB": "Mongoose ODM",
  "JWT": "Authentication",
  "Passport": "OAuth Integration",
  "Multer": "File Uploads",
  "Sharp": "Image Processing",
  "Nodemailer": "Email Services",
  "Bcryptjs": "Password Hashing",
  "CORS": "Cross-Origin Support"
}
```

### **AI/ML Technologies**

```json
{
  "TensorFlow": "2.10.1",
  "PyTorch": "2.0.1",
  "ONNX Runtime": "1.13.1",
  "Transformers": "4.30.2",
  "OpenCV": "4.7.0.72",
  "Scikit-learn": "1.2.2",
  "FastAPI": "0.103.1",
  "Uvicorn": "0.23.2"
}
```

### **Development Tools**

```json
{
  "Testing": "@testing-library/react, jest-dom",
  "Linting": "ESLint configuration",
  "Build Tools": "React Scripts 5.0.1",
  "Package Manager": "npm with package-lock.json"
}
```

---

## ⚛️ Frontend Implementation

### **🏗️ React Architecture Overview**

The MedLens frontend is built with **React 18.2.0** using modern hooks and functional components, implementing a **component-based architecture** with **role-based routing** and **responsive design**.

### **📱 Component Architecture**

#### **🎯 Core Components**

##### **Layout System**

- **`Layout.js`**: Main application wrapper with sidebar and navbar
- **`Sidebar.js`**: Collapsible navigation with role-based menu items
- **`NavbarInside.js`**: Top navigation bar with user controls
- **`ProtectedRoute.js`**: Role-based route protection
- **`AuthenticatedRoute.js`**: Authentication guard for protected pages

##### **AI Integration Components**

- **`ChatBot.js`**: Intelligent medical consultation interface
  - Real-time chat with AI medical assistant
  - Context-aware responses based on scan results
  - Message formatting with bullet points and sections
  - Loading states and error handling
- **`MedicalReport.js`**: AI analysis result display
- **`InfoSection.js`**: Educational content and information display

##### **Interactive Components**

- **`LocationPicker.js`**: Interactive map for location selection
  - Leaflet integration with custom markers
  - Geolocation support
  - Manual location selection
  - Portal-based modal implementation
- **`MedecienDetails.js`**: Medication information and details

### **🎨 User Interface Design**

#### **📱 Responsive Design System**

- **Mobile-First Approach**: Optimized for mobile devices
- **Breakpoint System**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Flexible Grid Layout**: CSS Grid and Flexbox implementation
- **Touch-Friendly Interface**: Optimized for touch interactions

#### **🎨 Design System**

- **Color Palette**: Medical-themed professional colors
- **Typography**: Clean, readable fonts for medical content
- **Iconography**: Lucide React icons for consistency
- **Spacing System**: Consistent padding and margins
- **Component Library**: Reusable UI components

#### **📊 CSS Architecture**

- **Modular CSS**: Component-specific stylesheets
- **CSS Custom Properties**: Theme variables for consistency
- **Responsive Units**: rem/em for scalable typography
- **Animation System**: Smooth transitions and micro-interactions

### **🔄 State Management**

#### **Redux Toolkit Implementation**

```javascript
// Store Configuration
const store = configureStore({
  reducer: {
    hero: heroReducer,
    features: featuresReducer,
    stats: statsReducer,
    howItWorks: howItWorksReducer,
    testimonials: testimonialsReducer,
    faq: faqReducer,
    feedback: feedbackReducer,
    overview: overviewReducer,
    roles: rolesReducer,
  },
});
```

#### **State Slices**

- **`heroSlice.js`**: Landing page hero section data
- **`featuresSlice.js`**: Platform features and capabilities
- **`statsSlice.js`**: Application statistics and metrics
- **`testimonialsSlice.js`**: User testimonials and reviews
- **`faqSlice.js`**: Frequently asked questions
- **`feedbackSlice.js`**: User feedback management
- **`overviewSlice.js`**: Platform overview data
- **`rolesSlice.js`**: User role management

### **🛣️ Routing & Navigation**

#### **React Router v6 Implementation**

```javascript
// Route Structure
<Router>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/signup" element={<SignUpForm />} />
    <Route path="/login" element={<LoginForm />} />

    {/* Protected Routes */}
    <Route element={<Layout />}>
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute requiredRole="Patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute requiredRole="Doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy-dashboard"
        element={
          <ProtectedRoute requiredRole="Pharmacy">
            <PharmacyDashboard />
          </ProtectedRoute>
        }
      />
    </Route>
  </Routes>
</Router>
```

#### **Role-Based Access Control**

- **Patient Routes**: Dashboard, appointments, scans, pharmacy
- **Doctor Routes**: Patient management, appointments, scan review
- **Pharmacy Routes**: Inventory, orders, patient services
- **Shared Routes**: Scan functionality, location services

### **🗺️ Interactive Features**

#### **Location Services**

- **Leaflet Integration**: Interactive maps for location selection
- **Geolocation API**: Automatic current location detection
- **Custom Markers**: Medical-themed map markers
- **Search Functionality**: Find nearby doctors and pharmacies
- **Address Validation**: Real-time address verification

#### **Real-Time Features**

- **Live Chat**: AI-powered medical consultation
- **Real-Time Updates**: Appointment status, scan results
- **Push Notifications**: Appointment reminders and updates
- **Live Search**: Instant search results with debouncing

### **📱 Page Components**

#### **🏠 Landing Pages**

- **`Homepage.js`** (23KB, 601 lines): Main landing page
  - Hero section with call-to-action
  - Feature showcase with animations
  - Testimonials carousel
  - FAQ section with expandable answers
  - Statistics and metrics display
- **`AboutUsPage.js`** (5.6KB, 152 lines): Team and company information
- **`ServicesPage.js`** (4.1KB, 111 lines): Service offerings

#### **🔐 Authentication Pages**

- **`Login.js`** (7.2KB, 209 lines): User login with validation
- **`Signup.js`** (16KB, 440 lines): User registration with role selection
- **`Signupgoogel.js`** (5.1KB, 141 lines): Google OAuth integration
- **`ForgotPassword.js`** (2.3KB, 77 lines): Password recovery
- **`ConfirmResetCode.js`** (3.3KB, 110 lines): Reset code verification
- **`NewPassword.js`** (3.6KB, 124 lines): New password setup

#### **👤 Dashboard Pages**

- **`PatientDashbord.js`** (12KB, 340 lines): Patient dashboard
  - Medical history overview
  - Appointment management
  - Scan results display
  - Quick actions panel
- **`DoctorDashbord.js`** (11KB, 315 lines): Doctor dashboard
  - Patient management interface
  - Appointment scheduling
  - Scan review tools
  - Professional profile management
- **`PharmacyDashboard.js`** (25KB, 752 lines): Pharmacy dashboard
  - Inventory management system
  - Order processing interface
  - Medication database
  - Customer service tools

#### **🔬 Medical Features**

- **`Scan.js`** (10KB, 311 lines): AI scan interface
  - File upload with drag-and-drop
  - Body part selection
  - Real-time AI analysis
  - Results display with confidence scores
  - Chat integration for medical consultation
- **`MedicalReport.js`**: Comprehensive medical report generation

#### **👨‍⚕️ Service Pages**

- **`Doctor.js`** (13KB, 387 lines): Doctor discovery and booking
  - Doctor search and filtering
  - Profile viewing and reviews
  - Appointment booking interface
  - Location-based recommendations
- **`Pharmacy.js`** (7.1KB, 222 lines): Pharmacy services
  - Medication search and availability
  - Pharmacy location finder
  - Order management interface

#### **👤 Profile Management**

- **`PatientProfile.js`** (31KB, 1029 lines): Patient profile management
- **`DoctorProfile.js`** (62KB, 1850 lines): Doctor profile and settings
- **`PharmacyProfile.js`** (46KB, 1514 lines): Pharmacy profile management

### **🎯 Advanced Features**

#### **🔍 Search & Filtering**

- **Real-time Search**: Instant results with debouncing
- **Advanced Filters**: Multiple criteria filtering
- **Sorting Options**: Various sorting algorithms
- **Pagination**: Efficient data loading

#### **📊 Data Visualization**

- **Charts and Graphs**: Medical data visualization
- **Progress Indicators**: Loading and progress states
- **Statistics Display**: Key metrics and analytics
- **Interactive Elements**: Clickable charts and graphs

#### **🔔 Notifications System**

- **Toast Notifications**: Success, error, and warning messages
- **Alert Dialogs**: Confirmation and warning dialogs
- **Loading States**: Skeleton screens and spinners
- **Error Boundaries**: Graceful error handling

#### **📱 Mobile Optimization**

- **Touch Gestures**: Swipe, pinch, and tap interactions
- **Mobile Navigation**: Collapsible sidebar and hamburger menu
- **Responsive Images**: Optimized for different screen sizes
- **Performance Optimization**: Lazy loading and code splitting

### **🛡️ Security & Performance**

#### **Security Features**

- **JWT Token Management**: Secure authentication
- **Input Validation**: Client-side form validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Cross-site request forgery prevention

#### **Performance Optimization**

- **Code Splitting**: Dynamic imports for better loading
- **Lazy Loading**: Component and image lazy loading
- **Memoization**: React.memo and useMemo optimization
- **Bundle Optimization**: Tree shaking and minification

#### **Accessibility**

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Proper focus indicators

### **🔧 Development Tools**

#### **Build System**

- **Create React App**: Standard React build setup
- **Webpack Configuration**: Custom build optimization
- **Babel Configuration**: Modern JavaScript support
- **ESLint & Prettier**: Code quality and formatting

#### **Testing Framework**

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **User Event Testing**: User interaction testing
- **Mock Service Worker**: API mocking

---

## 📦 Installation & Setup

### **Prerequisites**

- **Node.js** (v14 or higher)
- **Python** (3.8 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager
- **Git** for version control

### **Step-by-Step Installation**

#### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/MedLens.git
cd MedLens
```

#### 2. **Frontend Setup**

```bash
cd frontend
npm install
```

#### 3. **Backend Setup**

```bash
cd backend
npm install
pip install -r requirements.txt
```

#### 4. **Environment Configuration**

Create `.env` files in the backend directory:

```env
# Database Configuration
DATABASE=mongodb://localhost:27017/medlens
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/medlens
PORT=4000

# JWT Configuration (Generate a strong secret!)
JWT_SECRET=your_super_secure_jwt_secret_here_64_chars_minimum
JWT_EXPIRES_IN=90d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password  # Use app passwords, not account password

# Google OAuth (Get from Google Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# File Upload Security
MAX_FILE_SIZE=5242880  # 5MB limit
UPLOAD_PATH=./public/uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp
```

#### 5. **AI Models Setup**

```bash
cd backend/Models_ai
# Contact development team for access to AI models
# Models should be placed in the Models_ai directory
# Contact development team for access credentials
```

### **🔒 Security Configuration**

#### **Important Security Notes:**

- Never commit `.env` files to version control
- Use environment variables for all sensitive configuration
- Generate strong JWT secrets (minimum 64 characters)
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate all file uploads and sanitize filenames
- Regularly update dependencies for security patches

#### **Required .gitignore Entries:**

```
# Environment files
.env
.env.local
.env.production

# AI Models (large files)
backend/Models_ai/*.h5
backend/Models_ai/*.pkl
backend/Models_ai/*.joblib

# Uploads directory
backend/public/uploads/scans/*
backend/public/uploads/users/*
!backend/public/uploads/users/default.jpg

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# Dependencies
node_modules/
__pycache__/
*.pyc

# OS generated files
.DS_Store
Thumbs.db
```

---

## 🚀 Running the Application

### **Development Mode**

#### 1. **Start the Backend Server**

```bash
cd backend
npm start
# Server runs on: http://localhost:4000
```

#### 2. **Start the AI Service**

```bash
cd backend/fast_api
python main.py
# AI service runs on: http://127.0.0.1:8000
```

#### 3. **Start the Frontend Development Server**

```bash
cd frontend
npm start
# Frontend runs on: http://localhost:3000
```

### **Production Mode**

#### 1. **Build the Frontend**

```bash
cd frontend
npm run build
```

#### 2. **Start Production Servers**

```bash
# Backend
cd backend
npm start

# AI Service
cd backend/fast_api
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### **System Requirements**

- **RAM**: 8GB+ (for AI model loading)
- **Storage**: 5GB+ (for all AI models and application)
- **CPU**: Multi-core recommended
- **GPU**: Optional (CUDA support for faster AI inference)

---

## 📁 Project Structure

```
MedLens/
├── 📁 frontend/                    # React Frontend Application
│   ├── 📁 public/                  # Static files and assets
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable React components
│   │   │   ├── AuthenticatedRoute.js
│   │   │   ├── ChatBot.js
│   │   │   ├── Layout.js
│   │   │   ├── MedicalReport.js
│   │   │   ├── NavbarInside.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Sidebar.js
│   │   ├── 📁 Pages/               # Main application pages
│   │   │   ├── Homepage.js         # Landing page
│   │   │   ├── Login.js            # Authentication
│   │   │   ├── Signup.js           # User registration
│   │   │   ├── Scan.js             # AI scan interface
│   │   │   ├── PatientDashbord.js  # Patient dashboard
│   │   │   ├── DoctorDashbord.js   # Doctor dashboard
│   │   │   ├── PharmacyDashboard.js # Pharmacy dashboard
│   │   │   └── [Other pages...]
│   │   ├── 📁 Styles/              # CSS stylesheets
│   │   ├── 📁 assets/              # Images and static assets
│   │   ├── 📁 redux/               # State management
│   │   └── App.js                  # Main application component
│   ├── package.json                # Frontend dependencies
│   └── README.md                   # Frontend documentation
│
├── 📁 backend/                     # Backend Services
│   ├── 📁 fast_api/                # FastAPI AI Service
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── models.py               # AI model management
│   │   ├── image_processor.py      # Image processing logic
│   │   ├── chat_handler.py         # Chat functionality
│   │   ├── text_generator.py       # Medical text generation
│   │   └── schemas.py              # Data schemas
│   ├── 📁 controllers/             # Business logic controllers
│   │   ├── authController.js       # Authentication logic
│   │   ├── userController.js       # User management
│   │   ├── medicalScanController.js # Scan management
│   │   ├── appointmentController.js # Appointment logic
│   │   ├── doctorController.js     # Doctor management
│   │   ├── pharmacyController.js   # Pharmacy management
│   │   └── [Other controllers...]
│   ├── 📁 models/                  # MongoDB data models
│   │   ├── userModel.js            # User schema
│   │   ├── appointmentModel.js     # Appointment schema
│   │   ├── medicalScanModel.js     # Scan schema
│   │   └── [Other models...]
│   ├── 📁 routes/                  # API route definitions
│   ├── 📁 config/                  # Configuration files
│   ├── 📁 utils/                   # Utility functions
│   ├── 📁 scripts/                 # Utility scripts
│   ├── 📁 public/                  # File uploads and static files
│   ├── 📁 Models_ai/               # AI model files (confidential)
│   ├── app.js                      # Express application setup
│   ├── server.js                   # Server configuration
│   ├── package.json                # Backend dependencies
│   └── requirements.txt            # Python dependencies
│
├── 📁 ai_notebooks/                # AI Development Notebooks
│   ├── bone_notebook.ipynb         # Bone analysis (313 KB)
│   ├── brain_notebook.ipynb        # Brain scan analysis (400 KB)
│   ├── chest_notebook.ipynb        # Chest X-ray analysis (384 KB)
│   ├── eye_notebook.ipynb          # Eye examination (720 KB)
│   ├── kidney_notebook.ipynb       # Kidney analysis (342 KB)
│   ├── lung_notebook.ipynb         # Lung analysis (405 KB)
│   ├── Nail_model.ipynb           # Nail analysis (569 KB)
│   ├── skin_notebook.ipynb        # Skin condition analysis (558 KB)
│   └── AI_Guide.md                # AI documentation
│
└── README.md                       # This comprehensive documentation
```

---

## 🔧 API Documentation

### **Authentication Endpoints**

```
POST /api/users/signup          # User registration
POST /api/users/login           # User login
POST /api/users/forgotPassword  # Password reset
POST /api/users/resetPassword   # Password reset confirmation
GET  /api/users/me              # Get current user
PATCH /api/users/updateMe       # Update user profile
DELETE /api/users/deleteMe      # Delete user account
```

### **Medical Scan Endpoints**

```
POST /api/medical-scans         # Upload new scan
GET /api/medical-scans          # Get user scans
GET /api/medical-scans/:id      # Get specific scan
PATCH /api/medical-scans/:id    # Update scan
DELETE /api/medical-scans/:id   # Delete scan
POST /api/medical-scans/:id/upload # Upload scan image
```

### **Appointment Endpoints**

```
POST /api/appointments          # Create appointment
GET /api/appointments           # Get appointments
GET /api/appointments/:id       # Get specific appointment
PATCH /api/appointments/:id     # Update appointment
DELETE /api/appointments/:id    # Cancel appointment
GET /api/appointments/slots     # Get available time slots
```

### **Doctor Endpoints**

```
GET /api/doctors                # Get all doctors
GET /api/doctors/:id            # Get specific doctor
GET /api/doctors/profile        # Get doctor profile
PATCH /api/doctors/profile      # Update doctor profile
GET /api/doctors/nearby         # Find nearby doctors
```

### **Pharmacy Endpoints**

```
GET /api/pharmacies             # Get all pharmacies
GET /api/pharmacies/:id         # Get specific pharmacy
GET /api/pharmacies/profile     # Get pharmacy profile
PATCH /api/pharmacies/profile   # Update pharmacy profile
GET /api/pharmacies/nearby      # Find nearby pharmacies
```

### **AI Service Endpoints**

```
POST /predict/                  # AI image analysis
POST /chat                      # AI chat interface
```

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### **Development Workflow**

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
7. **Open a Pull Request**

### **Code Standards**

- Follow ESLint configuration
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed
- Follow the existing code style

### **Reporting Issues**

- Use the GitHub issue tracker
- Provide detailed bug reports
- Include steps to reproduce
- Specify your environment details

---

## 👨‍💻 Development Team

### **Backend Development**

- **[Ahmad Al-Ahmady](https://github.com/Ahmad-AL-Ahmady)** - Backend Lead

  - Node.js, Express, MongoDB
  - API development and database design
  - Authentication and security implementation

- **[Karim Osama](https://github.com/karimosama7)** - AI Lead
  - TensorFlow, PyTorch, FastAPI
  - Machine learning model development
  - AI service architecture and deployment

### **Frontend Development**

- **[Ahmed Al-Ashmawy](https://github.com/ahmed-alashmawy)** - React Developer

  - React.js, Redux, modern UI/UX
  - Component architecture and state management

- **[ALZahraa El-Sayed](https://github.com/alzahraa23)** - React Developer

  - User interface design and implementation
  - Responsive design and accessibility

- **[Ola Tarek](https://github.com/OlaTarek012)** - React Developer
  - Frontend functionality and user experience
  - Integration with backend services

### **Project Management**

- **Team Collaboration**: Agile development methodology
- **Code Review**: Peer review process for quality assurance
- **Documentation**: Comprehensive documentation maintenance
- **Testing**: Continuous integration and testing practices

---

## 🔐 Privacy & Security

### **Data Protection**

- All medical data is encrypted at rest and in transit
- HIPAA-compliant data handling procedures
- User consent required for all data processing
- Automatic data anonymization for AI training
- Regular security audits and penetration testing

### **Medical Disclaimer**

- This platform provides AI-assisted analysis, not medical diagnosis
- Always consult qualified healthcare professionals for medical decisions
- AI results should be verified by licensed medical practitioners
- Platform not intended for emergency medical situations

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **License Terms**

- ✅ **Commercial Use**: Allowed
- ✅ **Modification**: Allowed
- ✅ **Distribution**: Allowed
- ✅ **Private Use**: Allowed
- ❌ **Liability**: Limited
- ❌ **Warranty**: Limited

---

## 🙏 Acknowledgments

- **Open Source Community**: For invaluable tools and libraries
- **Medical Professionals**: For domain expertise and validation
- **AI Research Community**: For cutting-edge machine learning techniques
- **Contributors**: Everyone who has helped shape this project

---

## 📞 Support & Contact

### **Getting Help**

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/MedLens/issues)
- **Documentation**: Check the [Wiki](https://github.com/yourusername/MedLens/wiki)
- **Email**: Contact the development team directly

### **Community**

- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/MedLens/discussions)
- **Contributions**: See our [Contributing Guide](CONTRIBUTING.md)
- **Code of Conduct**: Review our [Code of Conduct](CODE_OF_CONDUCT.md)

---

<div align="center">

**Made with ❤️ by the MedLens Development Team**

_Empowering healthcare through artificial intelligence_

[![GitHub stars](https://img.shields.io/github/stars/Ahmad-AL-Ahmady/MedLens?style=social)](https://github.com/Ahmad-AL-Ahmady/MedLens)
[![GitHub forks](https://img.shields.io/github/forks/Ahmad-AL-Ahmady/MedLens?style=social)](https://github.com/Ahmad-AL-Ahmady/MedLens)
[![GitHub issues](https://img.shields.io/github/issues/Ahmad-AL-Ahmady/MedLens)](https://github.com/Ahmad-AL-Ahmady/MedLens/issues)

</div>

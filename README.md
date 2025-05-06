# MedLens - AI-Powered Healthcare Platform

MedLens is a comprehensive healthcare platform that combines medical image analysis, clinic management, and pharmacy services. The system leverages artificial intelligence to provide accurate medical diagnostics and streamline healthcare services.

## Features

- **AI-Powered Medical Image Analysis**

  - X-ray detection and analysis
  - Body part classification
  - Nail condition analysis
  - Chest condition analysis
  - Eye condition analysis
  - Skin condition analysis

- **Healthcare Management**

  - Clinic management system
  - Doctor profiles and scheduling
  - Patient records management
  - Pharmacy services integration

- **User-Friendly Interface**
  - Modern, responsive design
  - Interactive maps for clinic locations
  - Real-time chat and notifications
  - Secure authentication system

## Tech Stack

### Frontend

- React.js 18.2.0
- React Router v6.29.0
- Leaflet 1.9.4 with react-leaflet 4.2.1
- Axios 1.7.9
- SweetAlert2 11.19.1
- Lucide React 0.475.0
- React Simple Star Rating 5.1.7
- React Icons 5.4.0
- Date-fns 4.1.0
- Testing Libraries:
  - @testing-library/react 13.4.0
  - @testing-library/jest-dom 5.14.1
  - @testing-library/user-event 13.2.1

### Backend

- Node.js with Express
- FastAPI for AI processing
- MongoDB with Mongoose
- JWT Authentication
- Google OAuth Integration
- Multer for file uploads
- Sharp for image processing

### AI/ML Stack

- TensorFlow 2.10.1
- PyTorch 2.0.1
- ONNX Runtime
- Transformers
- OpenCV
- Scikit-learn

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- MongoDB
- npm or yarn
- Required Python packages (listed in backend/requirements.txt)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/MedLens.git
   cd MedLens
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup**

   ```bash
   cd backend
   npm install
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   - Copy `.env.example` to `.env` in the backend directory
   - Configure your environment variables (MongoDB connection, JWT secret, etc.)

## Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   # For development
   npm run dev
   # For production
   npm start
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
MedLens/
├── frontend/               # React frontend application
│   ├── public/             # Static files
│   └── src/                # Source code
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       ├── styles/         # CSS styles
│       ├── App.js          # Main application file
│       └── utils/          # Utility functions
│
└── backend/                # Backend services
    ├── fast_api/           # FastAPI application
    ├── Models_ai/          # AI model files
    ├── config/             # Configuration files
    ├── controllers/        # Business logic
    ├── models/             # Data models
    ├── routes/             # Express routes
    ├── scripts/            # Utility scripts
    ├── utils/              # Utility functions
    ├── app.js              # Main application file
    ├── server.js           # Server configuration
    ├── start.js            # Application starter
    ├── package.json        # Backend dependencies
    └── requirements.txt    # Python dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Team

### Backend Team

- [Ahmad Al-Ahmady](https://github.com/Ahmad-AL-Ahmady) - Backend Lead (Node.js, Express, MongoDB)
- [Karim Osama](https://github.com/karimosama7) - AI Lead (TensorFlow, PyTorch, FastAPI)

### Frontend Team

- [Ahmed Al-Ashmawy](https://github.com/ahmed-alashmawy) - React Developer
- [ALZahraa El-Sayed](https://github.com/alzahraa23) - React Developer
- [Ola Tarek](https://github.com/OlaTarek012) - React Developer

### For more info checkout the About us page in our Application.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries

## Support

For support, please open an issue in the GitHub repository or contact the development team.

# MedLens - AI-Powered Medical Image Analysis System

MedLens is an advanced medical image analysis platform that leverages artificial intelligence to assist in medical diagnosis through image analysis. The system uses multiple specialized AI models to analyze different types of medical images and provide diagnostic assistance.

## Features

- **Multi-Modal Image Analysis**

  - X-ray detection and analysis
  - Body part classification
  - Nail condition analysis
  - Chest condition analysis
  - Eye condition analysis
  - Skin condition analysis

- **Intelligent Diagnosis**

  - Automated image classification
  - Specialized models for different medical conditions
  - Real-time analysis and results

- **User-Friendly Interface**
  - Easy image upload
  - Clear diagnostic results
  - Interactive chat for additional information

## Tech Stack

### Frontend

- React.js
- Create React App
- Modern UI components

### Backend

- FastAPI (Python) for AI processing
- Node.js for additional services
- Keras for machine learning models

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
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
   - Configure your environment variables

## Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   python main.py
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
├── frontend/           # React frontend application
├── backend/            # Backend services
│   ├── routes/        # API routes
│   ├── controllers/   # Business logic
│   ├── models/        # Data models
│   ├── utils/         # Utility functions
│   └── main.py        # Main FastAPI application
└── Models_ai/         # AI model files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries

## Support

For support, please open an issue in the GitHub repository or contact the development team.

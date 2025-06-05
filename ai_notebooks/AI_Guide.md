# AI_Guide - MedLens AI Component Documentation

### 📚 Introduction

This guide provides comprehensive documentation for the **Artificial Intelligence components** of the MedLens project. It focuses specifically on the AI implementation, model architecture, machine learning workflows, and intelligent systems that power the medical imaging analysis capabilities.

The AI component represents the core intelligence of MedLens, featuring:

- **8 Specialized Medical AI Models** for different body parts and conditions
- **Advanced Image Processing Pipeline** with hierarchical classification
- **Natural Language Processing** for medical information generation
- **Intelligent Chat System** for medical consultations
- **Research & Development Notebooks** documenting the AI model creation process

### 📁 AI Project Structure:

```
MedLens/
├── frontend/                    # React frontend application
│
├── backend/                     # Backend services
│   ├── fast_api/                # FastAPI application
│   │   ├── main.py              # FastAPI entry point
│   │   ├── models.py            # AI model management
│   │   ├── image_processor.py   # Image processing logic
│   │   ├── chat_handler.py      # Chat functionality
│   │   ├── text_generator.py    # Medical text generation
│   │   └── schemas.py           # Data schemas
│   ├── Models_ai/               # AI model files (confidential)
│
└── ai_notebooks/                # Jupyter notebooks for AI development
    ├── bone_notebook.ipynb      # Bone fracture analysis (313 KB)
    ├── brain_notebook.ipynb     # Brain tumor detection (400 KB)
    ├── chest_notebook.ipynb     # Chest X-ray analysis (384 KB)
    ├── eye_notebook.ipynb       # Eye disease detection (720 KB)
    ├── kidney_notebook.ipynb    # Kidney condition analysis (342 KB)
    ├── lung_notebook.ipynb      # Lung cancer detection (405 KB)
    ├── Nail_model.ipynb         # Nail condition analysis (569 KB)
    └── skin_notebook.ipynb      # Skin condition detection (558 KB)
```

---

## 🤖 AI Models & Capabilities

### 📊 Model Architecture Overview

The system employs a **hierarchical classification approach**:

1. **Primary Classifier**: Determines if the uploaded image is a valid X-ray
2. **Specialized Models**: Body-part specific models for detailed diagnosis
3. **Language Model**: Local Llama model for medical information generation

### 🎯 Supported Medical Specialties

#### 🫁 **Chest X-Ray Analysis** (9 Conditions)

- Air Embolism Conditions
- Chronic Obstructive Pulmonary Disease
- Encapsulated Lesions
- Mediastinal Disorders
- Normal Anatomy
- Pleural Pathologies
- Pneumonia
- Pulmonary Fibrotic Conditions
- Thoracic Abnormalities

#### 👁️ **Eye Examination** (8 Conditions)

- Age-related Macular Degeneration
- Choroidal Neovascularization
- Central Serous Retinopathy
- Diabetic Macular Edema
- Diabetic Retinopathy
- DRUSEN
- Macular Hole
- Normal Eye

#### 🧠 **Brain Tumor Detection** (4 Types)

- Glioma
- Meningioma
- Normal Brain
- Pituitary Tumor

#### 🦴 **Bone Fracture Analysis** (10 Types)

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

#### 🫀 **Additional Specialties**

- **Lung Cancer**: Benign/Malignant/Normal classification
- **Kidney Analysis**: Normal/Tumor detection
- **Skin Conditions**: Benign/Malignant classification
- **Nail Disorders**: Healthy/Onychomycosis/Psoriasis

---

## 🔧 FastAPI Backend Components

### 1. **main.py** - Application Entry Point

**Purpose**: Main FastAPI application setup and API endpoints

**Key Features**:

- CORS middleware configuration for cross-origin requests
- Global diagnosis state management
- Two primary endpoints:
  - `POST /predict/` - Image diagnosis
  - `POST /chat` - Conversational interface

**Technical Setup**:

```python
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])
models = load_all_models()  # Load all AI models at startup
```

### 2. **models.py** - AI Model Management

**Purpose**: Centralized model loading and configuration

**Model Categories**:

- **Classification Models**: Keras/TensorFlow models for each body part
- **Language Model**: Local Llama model (GGUF format) for text generation
- **Model Mapping**: Body part to model assignment logic

**Technical Specifications**:

- **Context Length**: 2048 tokens
- **Processing Threads**: 4 threads
- **Model Format**: GGUF (optimized for local inference)

### 3. **image_processor.py** - Image Analysis Pipeline

**Purpose**: Complete image processing and diagnosis workflow

**Processing Steps**:

1. **Image Preprocessing**: Resize to 224x224, normalize to [0,1]
2. **Primary Classification**: Validate X-ray authenticity
3. **Specialized Analysis**: Body-part specific diagnosis
4. **Medical Information Generation**: Automatic medical content creation

**Quality Assurance**:

- Input validation for image format
- Confidence score calculation
- Error handling for invalid inputs

### 4. **chat_handler.py** - Conversational Interface

**Purpose**: Intelligent chat system for medical consultations

**Supported Interactions**:

- **System Identity**: Responds to "Who are you?" queries
- **Team Information**: Development team details
- **Medical Consultations**: Diagnosis-specific Q&A
- **Multilingual Support**: Arabic and English keywords
- **Input Validation**: X-ray image verification prompts

**Smart Features**:

- Context-aware responses based on current diagnosis
- Automatic medical information retrieval
- Greeting and welcome message handling

### 5. **text_generator.py** - Medical Content Generation

**Purpose**: AI-powered medical text generation

**Generation Parameters**:

- **Max Tokens**: 512
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Top-p**: 0.95 (nucleus sampling)
- **Stop Sequences**: Prevents unwanted continuations

**Content Structure**:

- Medical condition description
- Causes and risk factors
- Symptoms and signs
- Treatment options
- 3-5 practical patient advice points

### 6. **schemas.py** - Data Models

**Purpose**: Pydantic models for request/response validation

**Data Structures**:

- `ChatRequest`: Message handling schema
- `DiagnosisInfo`: Comprehensive diagnosis state management

---

## 📓 AI Development Notebooks

#### **Bone Analysis** (`bone_notebook.ipynb` - 313 KB)

- **Focus**: Fracture type classification
- **Dataset**: Bone X-ray images with 10 fracture categories
- **Techniques**: CNN architectures, data augmentation
- **Output**: Specialized bone fracture detection model

#### **Brain Analysis** (`brain_notebook.ipynb` - 400 KB)

- **Focus**: Brain tumor detection and classification
- **Dataset**: MRI/CT brain scans
- **Categories**: Glioma, Meningioma, Pituitary, Normal
- **Advanced Features**: Tumor localization and grading

#### **Chest Analysis** (`chest_notebook.ipynb` - 384 KB)

- **Focus**: Comprehensive chest pathology detection
- **Scope**: 9 different chest conditions
- **Dataset**: Large-scale chest X-ray collections
- **Innovation**: Multi-class classification with high accuracy

#### **Eye Analysis** (`eye_notebook.ipynb` - 720 KB)

_Largest notebook indicating complex ophthalmology work_

- **Focus**: Retinal disease detection
- **Techniques**: Advanced image preprocessing for fundus images
- **Conditions**: 8 major eye diseases including diabetic retinopathy
- **Clinical Relevance**: Early detection of vision-threatening conditions

#### **Kidney Analysis** (`kidney_notebook.ipynb` - 342 KB)

- **Focus**: Kidney pathology and tumor detection
- **Binary Classification**: Normal vs. Tumor
- **Imaging**: Ultrasound and CT-based analysis
- **Clinical Impact**: Early cancer detection

#### **Lung Analysis** (`lung_notebook.ipynb` - 405 KB)

- **Focus**: Lung cancer screening
- **Classification**: Benign/Malignant/Normal
- **Techniques**: Deep learning for nodule detection
- **Screening Application**: Mass screening tool development

#### **Nail Analysis** (`Nail_model.ipynb` - 569 KB)

- **Focus**: Dermatological nail conditions
- **Conditions**: Onychomycosis, Psoriasis, Healthy nails
- **Innovation**: Novel application of AI to nail pathology
- **Accessibility**: Non-invasive diagnostic tool

#### **Skin Analysis** (`skin_notebook.ipynb` - 558 KB)

- **Focus**: Skin cancer detection
- **Critical Application**: Melanoma vs. benign lesion classification
- **Technique**: Dermoscopic image analysis
- **Public Health Impact**: Early skin cancer detection

---

## 🔄 System Workflow

### 📸 Image Diagnosis Workflow

```
Image Upload → Preprocessing → Primary Validation →
Body Part Detection → Specialized Model Inference →
Confidence Assessment → Medical Information Generation →
Result Presentation
```

### 💬 Chat System Workflow

```
User Message → Intent Recognition → Context Analysis →
Response Generation → Medical Content Retrieval →
Formatted Response Delivery
```

---

## 🚀 Deployment & Technical Requirements

### **Python Dependencies** (requirements.txt)

```
# ----------------------------
# Core & Web Server
# ----------------------------
fastapi==0.103.1
uvicorn==0.23.2
python-multipart==0.0.6
python-dotenv

# ----------------------------
# Machine Learning Framework
# ----------------------------
tensorflow==2.10.1
protobuf==3.19.6  # Explicitly pinned for compatibility
transformers==4.30.2
ctransformers

# ----------------------------
# ONNX Ecosystem
# ----------------------------
onnx==1.12.0  # Downgraded further to accept protobuf<3.20
onnxruntime==1.13.1  # Compatible with ONNX 1.12

# ----------------------------
# PyTorch (CPU)
# ----------------------------
torch==2.0.1
torchvision==0.15.2
torchaudio==2.0.2

# ----------------------------
# Data Processing & Imaging
# ----------------------------
numpy==1.23.5
Pillow==9.5.0
opencv-python==4.7.0.72
matplotlib==3.7.1
pandas==1.5.3
scikit-learn==1.2.2
seaborn==0.12.2
```

### **System Requirements**

- **Python**: 3.8+
- **Memory**: 8GB+ RAM (for model loading)
- **Storage**: 5GB+ (for all AI models)
- **CPU**: Multi-core recommended
- **GPU**: Optional (CUDA support for faster inference)

### **Server Configuration**

```bash
# Development
python main.py
# Server runs on: http://127.0.0.1:8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

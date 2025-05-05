from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np
import io
import os
import uvicorn
from keras.models import load_model
from ctransformers import AutoModelForCausalLM

# Setup FastAPI
app = FastAPI()

# Configure CORS Middleware to allow connections from all sources
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load GGML/GGUF model using ctransformers
MODEL_PATH = "Models_ai\\ggml-model-Q8_0.gguf"  # Make sure the path to the file is correct
llm = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    model_type="llama",  # Specify model type (llama, gpt2, gpt-j, etc.)
    context_length=2048,  # Context window size (similar to n_ctx)
    threads=4  # Number of threads for processing - adjust according to your device
)


# Load local models (example for X-ray classification models)
def load_local_model(model_name: str):
    model_path = f"./{model_name}"
    if os.path.exists(model_path):
        print(f"Loading {model_name} from local storage...")
        return load_model(model_path)
    else:
        print(f"Model {model_name} not found locally. Downloading...")
        model = load_model(model_name)
        model.save(model_path)  # Save the model locally
        return model


# Load models
primary_model = load_local_model("Models_ai/RAy_not_Ray.h5")
nail_model = load_local_model("Models_ai/nail.h5")
chest_model = load_local_model("Models_ai/chest.h5")
Eye_model = load_local_model("Models_ai/Eye.h5")
skin_model = load_local_model("Models_ai/skin_1.h5")
bone_model = load_local_model("Models_ai/Bone.h5")
kidney_model = load_local_model("Models_ai/kidney_cancer.h5")
lung_model = load_local_model("Models_ai/lung_cancer_1.h5")
brain_model = load_local_model("Models_ai/Brain_Tumor_1.h5")


# Class names definitions for each classification
CLASS_NAMES = {
    "primary": ["Ray", "Not Ray"],
    "nail": ["Healthy", "Onychomycosis", "Psoriasis"],
    "chest": [
        "Air Embolism Conditions",
        "Chronic Obstructive Pulmonary",
        "Encapsulated Lesions",
        "Mediastinal Disorders",
        "Normal Anatomy",
        "Pleural Pathologies",
        "Pneumonia",
        "Pulmonary Fibrotic",
        "Thoracic Abnormalities",
    ],
    "Eye": [
        "Age-related Macular Degeneration",
        "Choroidal Neovascularization",
        "Central Serous Retinopathy",
        "Diabetic Macular Edema",
        "Diabetic Retinopathy",
        "DRUSEN",
        "Macular Hole",
        "NORMAL",
    ],
    "skin": ["benign", "malignant"],
    "bone": [
        "Avulsion fracture",
        "Comminuted fracture",
        "Fracture Dislocation",
        "Greenstick fracture",
        "Hairline Fracture",
        "Impacted fracture",
        "Longitudinal fracture",
        "Oblique fracture",
        "Pathological fracture",
        "Spiral Fracture",
    ],
    "kidney": ["Normal", "Tumor"],
    "lung": ["benign", "malignant", "Normal"],
    "brain": ["glioma", "meningioma", "Normal", "pituitary"],
}

BODY_PART_TO_MODEL = {
    "Chest": "chest",
    "Eye": "Eye",
    "Brain": "brain",
    "Bones": "bone",
    "Breast": "breast",
    "Lung": "lung",
    "Kidney": "kidney",
    "Nail": "nail",
    "Skin": "skin",
}


# Function to convert image to usable format
def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    return np.expand_dims(np.array(image) / 255.0, axis=0)


# Class for storing diagnosis information
class DiagnosisInfo:
    def __init__(self):
        self.classification_result = "Unknown"
        self.confidence_score = 0.0
        self.body_part = "Unknown"
        self.medical_info = ""  # Field to store medical information

    def update(self, classification, confidence, body_part="Unknown"):
        self.classification_result = classification
        self.confidence_score = confidence
        self.body_part = body_part
        # Clear medical information when updating diagnosis
        self.medical_info = ""

    def get_full_description(self):
        return (
            f"{self.classification_result} in {self.body_part}"
            if self.body_part != "Unknown"
            else self.classification_result
        )


diagnosis = DiagnosisInfo()


# Function to generate response from ctransformers model
def generate_response(prompt: str):
    # Setup generation parameters
    response = llm(
        prompt,
        max_new_tokens=512,
        temperature=0.7,
        top_p=0.95,
        stop=["Human:", "User:"]  # Words that end the response
    )

    # Clean response from any unwanted directives
    cleaned_response = response.strip()

    # Remove any directives like "Use appropriate language level..."
    unwanted_phrases = [
        "Use appropriate language level for an adult audience.",
        "Provide sources to support the information provided in the response.",
        "Use appropriate language level",
        "Provide sources",
        "adult audience"
    ]

    for phrase in unwanted_phrases:
        if cleaned_response.startswith(phrase):
            cleaned_response = cleaned_response[len(phrase):].strip()

    # Remove any unwanted symbolic formatting
    if cleaned_response.startswith("<"):
        # Try to delete any XML or HTML tags at the beginning of the response
        import re
        cleaned_response = re.sub(r"^<[^>]+>", "", cleaned_response).strip()

    return cleaned_response


# New function to get medical information automatically after diagnosis
def get_medical_info(condition_name):
    prompt = (
        f"Provide medical information about {condition_name}. "
        f"Include: Description, Causes, Symptoms, Treatments. "
        f"End with 3-5 practical advice points for patients as bullet points. "
        f"Be accurate and concise."
    )
    return generate_response(prompt)


# API for prediction using image model
@app.post("/predict/")
async def predict(file: UploadFile = File(...), bodyPart: str = Form("Chest")):
    global diagnosis
    try:
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        processed_img = preprocess_image(img)

        # Classify image using primary model
        primary_pred = primary_model.predict(processed_img)
        primary_class_idx = np.argmax(primary_pred[0])
        primary_class = CLASS_NAMES["primary"][primary_class_idx]
        primary_confidence = float(np.max(primary_pred[0]))

        # Check body part and select appropriate model
        if primary_class == "Ray" and bodyPart in BODY_PART_TO_MODEL:
            model_key = BODY_PART_TO_MODEL[bodyPart]

            if model_key == "chest":
                model_pred = chest_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["chest"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            elif model_key == "Eye":
                model_pred = Eye_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["Eye"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            elif model_key == "nail":
                model_pred = nail_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["nail"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            elif model_key == "skin":
                model_pred = skin_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["skin"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            elif model_key == "bone":
                model_pred = bone_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["bone"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            elif model_key == "kidney":
                model_pred = kidney_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["kidney"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            elif model_key == "lung":
                model_pred = lung_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["lung"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            elif model_key == "brain":
                model_pred = brain_model.predict(processed_img)
                result_idx = np.argmax(model_pred[0])
                classification_result = CLASS_NAMES["brain"][result_idx]
                confidence_score = float(np.max(model_pred[0]))
            else:
                classification_result = "Unknown body part"
                confidence_score = 0.0

            diagnosis.update(classification_result, confidence_score, bodyPart)

            # Automatically generate medical information after diagnosis
            if classification_result.lower() != "normal" and classification_result.lower() != "normal anatomy":
                # Only if there is a diagnosis of a disease or abnormal condition
                diagnosis.medical_info = get_medical_info(
                    diagnosis.get_full_description())
        else:
            classification_result = "Not a valid X-ray image"
            confidence_score = primary_confidence
            diagnosis.update(classification_result, confidence_score)
            diagnosis.medical_info = ""

        response_data = {
            "classification_result": diagnosis.get_full_description(),
            "confidence_score": round(confidence_score * 100, 2),
            "body_part": diagnosis.body_part,
        }

        # Add medical information to the response if available
        if diagnosis.medical_info:
            response_data["medical_info"] = diagnosis.medical_info

        return response_data

    except Exception as e:
        return {"error": str(e)}


# Class for representing chat requests with the model
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(request: ChatRequest):
    global diagnosis
    
    # Keywords to recognize questions about the development team
    team_keywords = ["who created you", "who created this", "who developed you", "who made you", 
                    "development team", "creators", "developers", "من طورك", "من صنعك", "من انشأك", 
                    "فريق التطوير", "المطورين", "من صمم", "من برمج", "مين عملك", "الفريق"]
    
    # Check if user is asking about the development team
    if any(keyword in request.message.lower() for keyword in team_keywords):
        return {
            "response": """The development team at MedLens:
- Ahmed Alahmady (Backend Developer)
- Ahmed Alashmawy (Frontend Developer)
- Ola Tarek (Frontend Developer)
- Alzahraa El Sayed (Frontend Developer)
- Karim Osama (AI Developer)"""
        }

    # Check if user is asking about the identity of the program
    if any(keyword in request.message.lower() for keyword in ["who are you", "من انت", "انت مين", "اسمك", "what are you", "your name", "ما اسمك"]):
        return {
            "response": "I am MedLens AI, your medical imaging analysis assistant. I can help diagnose medical conditions from X-ray images and provide valuable medical information."
        }

    # Automatic welcome message when receiving start or hello or hi or السلام عليكم
    if request.message.strip().lower() in ["start", "hello", "hi", "ابدأ", "مرحبا", "السلام عليكم"]:
        return {
            "response": "👋 Hello and welcome! I'm MedLens AI, here to help answer your medical imaging questions. Just ask away! 😊"
        }

    # Check X-ray image validity
    if diagnosis.classification_result == "No abnormalities detected" or diagnosis.classification_result == "Not a valid x-ray image":
        return {
            "response": "🚨 The image you uploaded is not a valid x-ray. Please upload a medical x-ray so I can provide an accurate medical analysis."
        }

    # If user requests medical information only
    if request.message.strip().lower() == "provide medical information about it":
        disease_name = diagnosis.get_full_description()
        if not diagnosis.medical_info:
            prompt = (
                f"Provide medical information about {disease_name}. "
                f"Include: Description, Causes, Symptoms, Treatments. "
                f"End with 3-5 practical advice points for patients as bullet points. "
                f"Be accurate and concise."
            )
            response = generate_response(prompt)
            diagnosis.medical_info = response
        else:
            response = diagnosis.medical_info
        return {"response": response}

    # If specific information is requested
    is_info_request = request.message.lower().startswith("provide information")

    if is_info_request:
        disease_name = (
            request.message.replace(
                "Provide information and treatments for", "")
            .replace("Provide information for", "")
            .strip()
        )

        if not disease_name or disease_name == diagnosis.classification_result:
            disease_name = diagnosis.get_full_description()

        prompt = (
            f"Provide medical information about {disease_name}. "
            f"Include: Description, Causes, Symptoms, Treatments. "
            f"End with 3-5 practical advice points for patients as bullet points. "
            f"Be accurate and concise."
        )
    else:
        prompt = (
            f"Context: The patient has been diagnosed with {diagnosis.get_full_description()} "
            f"(Confidence: {diagnosis.confidence_score:.2f}%).\n"
            f"Question: {request.message}\n"
            "Answer:"
        )

    response = generate_response(prompt)
    return {"response": response}


# Run the server
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
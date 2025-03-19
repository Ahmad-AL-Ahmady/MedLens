from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import numpy as np
from PIL import Image
import io
import os
import re
from dotenv import load_dotenv
from keras.models import load_model
import uvicorn

# Initialize FastAPI application
app = FastAPI()

# Configure CORS middleware to allow cross-origin requests
# This is necessary for frontend applications to communicate with the API
# NOTE: In production, consider restricting "allow_origins" to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, consider restricting in production
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load machine learning models for different medical image classifications
# Each model is specialized for a specific type of diagnosis
# NOTE: Consider lazy loading to reduce memory usage on startup
primary_model = load_model(
    "Models_ai/RAy_not_Ray.h5"
)  # Model to determine if image is an X-ray
classify_model = load_model(
    "Models_ai/optimized_0_model.h5"
)  # Model to classify body part
nail_model = load_model("Models_ai/nail.h5")  # Specialized model for nail conditions
chest_model = load_model("Models_ai/chest.h5")  # Specialized model for chest conditions
Eye_model = load_model("Models_ai/Eye.h5")  # Specialized model for eye conditions
skin_model = load_model("Models_ai/skin_1.h5")  # Specialized model for skin conditions

# Dictionary mapping model outputs to human-readable class names
# Organized by model type for easy lookup
CLASS_NAMES = {
    "primary": ["Ray", "Not Ray"],
    "classify": [
        "Bone",
        "Brain",
        "Breast",
        "Eye",
        "Nail",
        "Teeth",
        "chest",
        "kidney",
        "lung",
        "skin",
    ],
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
}


# Class to store the current diagnosis information across requests
# This allows the chat functionality to reference the most recent diagnosis
class DiagnosisInfo:
    def __init__(self):
        self.classification_result = "Unknown"
        self.confidence_score = 0.0
        self.body_part = "Unknown"

    def update(self, classification, confidence, body_part="Unknown"):
        """Update the diagnosis with new information"""
        self.classification_result = classification
        self.confidence_score = confidence
        self.body_part = body_part

    def get_full_description(self):
        """Return a formatted description of the diagnosis"""
        return (
            f"{self.classification_result} in {self.body_part}"
            if self.body_part != "Unknown"
            else self.classification_result
        )


# Create a global instance to store the current diagnosis
diagnosis = DiagnosisInfo()


# Function to preprocess images before feeding them to the models
def preprocess_image(image: Image.Image) -> np.ndarray:
    """
    Preprocess an image for model prediction:
    1. Resize to 224x224 (standard input size for many models)
    2. Normalize pixel values to range [0,1]
    3. Add batch dimension
    """
    image = image.resize((224, 224))
    return np.expand_dims(np.array(image) / 255.0, axis=0)


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    """
    Endpoint for analyzing medical images

    Takes an uploaded image and runs it through a cascade of models:
    1. Primary model to determine if it's an X-ray
    2. Classification model to determine body part
    3. Specialized model based on body part

    Returns the diagnosis with confidence score
    """
    global diagnosis
    try:
        # Read and preprocess the uploaded image
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        processed_img = preprocess_image(img)

        # Primary classification - is it an X-ray?
        primary_pred = primary_model.predict(processed_img)
        primary_class_idx = np.argmax(primary_pred[0])
        primary_class = CLASS_NAMES["primary"][primary_class_idx]
        primary_confidence = float(np.max(primary_pred[0]))  # Confidence score

        if primary_class == "Ray":
            # If it's an X-ray, determine the body part
            classify_pred = classify_model.predict(processed_img)
            classify_class_idx = np.argmax(classify_pred[0])
            classify_class = CLASS_NAMES["classify"][classify_class_idx]
            classify_confidence = float(np.max(classify_pred[0]))

            # Based on body part, use the appropriate specialized model
            if classify_class == "Nail":
                nail_pred = nail_model.predict(processed_img)
                result_idx = np.argmax(nail_pred[0])
                classification_result = CLASS_NAMES["nail"][result_idx]
                confidence_score = float(np.max(nail_pred[0]))
                diagnosis.update(classification_result, confidence_score, "Nail")
            elif classify_class == "chest":
                chest_pred = chest_model.predict(processed_img)
                result_idx = np.argmax(chest_pred[0])
                classification_result = CLASS_NAMES["chest"][result_idx]
                confidence_score = float(np.max(chest_pred[0]))
                diagnosis.update(classification_result, confidence_score, "Chest")
            elif classify_class == "Eye":
                Eye_pred = Eye_model.predict(processed_img)
                result_idx = np.argmax(Eye_pred[0])
                classification_result = CLASS_NAMES["Eye"][result_idx]
                confidence_score = float(np.max(Eye_pred[0]))
                diagnosis.update(classification_result, confidence_score, "Eye")
            elif classify_class == "skin":
                skin_pred = skin_model.predict(processed_img)
                result_idx = np.argmax(skin_pred[0])
                classification_result = CLASS_NAMES["skin"][result_idx]
                confidence_score = float(np.max(skin_pred[0]))
                diagnosis.update(classification_result, confidence_score, "Skin")
            else:
                # For body parts without a specialized model, use the classification result
                classification_result = classify_class
                confidence_score = classify_confidence
                diagnosis.update(
                    classification_result, confidence_score, classify_class
                )
        else:
            # If it's not an X-ray, return a generic response
            classification_result = "No abnormalities detected"
            confidence_score = primary_confidence
            diagnosis.update(classification_result, confidence_score)

        # Return the diagnosis information
        return {
            "classification_result": diagnosis.get_full_description(),
            "confidence_score": round(
                confidence_score * 100, 2
            ),  # Convert to percentage
            "body_part": diagnosis.body_part,
        }

    except Exception as e:
        # Catch any errors during processing
        # NOTE: Consider more specific error handling for different types of exceptions
        return {"error": str(e)}


# Function to clean responses from the language model
def clean_response(text, is_info_request=False):
    """
    Clean the response from the language model by removing:
    - Prompt instructions
    - Any query repetitions
    - Empty lines at the beginning

    Different cleaning logic is applied based on the request type
    """
    # Remove prompt instructions using regex patterns
    prompt_patterns = [
        r"You are a medical assistant\. Provide a detailed explanation about.*?Be concise but informative\.",
        r"You are a medical assistant\. The patient has been diagnosed with.*?Answer \(do not repeat the question in your answer\):",
        r"The patient has been diagnosed with.*?Answer the following question concisely and professionally:",
        r"Question:.*?\n",
    ]

    for pattern in prompt_patterns:
        text = re.sub(pattern, "", text, flags=re.DOTALL)

    # For non-info requests, extract just the answer part
    if not is_info_request and "Answer:" in text:
        text = text.split("Answer:")[1].strip()

    # Remove empty lines at the beginning
    lines = text.strip().split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)

    # Rejoin the cleaned text
    return "\n".join(lines).strip()


# Load environment variables for API keys
load_dotenv("env")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Validate that the API key exists
if not HUGGINGFACE_API_KEY:
    raise ValueError("🚨 Hugging Face API key is missing! Please check your .env file.")

# Configuration for the language model API
HUGGINGFACE_API_URL = (
    "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct"
)

HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}


# Pydantic model for chat request validation
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Endpoint for chatting with the medical assistant

    Based on the user's message and current diagnosis, formulates a prompt
    for the language model and returns the response

    Handles two types of requests:
    1. Information requests about conditions
    2. General questions about the current diagnosis
    """
    global diagnosis

    # Check if the current diagnosis is "No abnormalities detected"
    if diagnosis.classification_result == "No abnormalities detected":
        return {
            "response": "🚨 The image you uploaded is not a valid x-ray. Please upload a medical x-ray so I can provide an accurate medical analysis."
        }

    # Determine if this is a request for general information
    is_info_request = request.message.startswith(
        "Provide information"
    ) or request.message.startswith("Provide information and treatments for")

    if is_info_request:
        # For information requests, extract the condition name if specified
        disease_name = (
            request.message.replace("Provide information and treatments for", "")
            .replace("Provide information for", "")
            .strip()
        )

        # If no specific condition is mentioned, use the current diagnosis
        if not disease_name or disease_name == diagnosis.classification_result:
            disease_name = diagnosis.get_full_description()

        # Create a prompt for information about the condition
        prompt = (
            f"You are a medical assistant. Provide a detailed explanation about {disease_name}, "
            f"including its causes, symptoms, and available treatments. "
            f"At the end, provide a bullet-point list of 3-5 practical advice points or simple steps that patients "
            f"should follow. Format your response with clear sections for Description, Causes, Symptoms, Treatments, "
            f"and 'Advice for Patients' (as bullet points with • symbol). Be concise but informative."
        )
    else:
        # For general questions, include the current diagnosis in the prompt
        prompt = (
            f"You are a medical assistant. The patient has been diagnosed with {diagnosis.get_full_description()} "
            f"(Confidence: {diagnosis.confidence_score:.2f}%).\n"
            f"Answer the following question concisely and professionally:\n"
            f"Question: {request.message}\n"
            "Answer (do not repeat the question in your answer):"
        )

    try:
        # Call the language model API
        payload = {"inputs": prompt}
        response = requests.post(HUGGINGFACE_API_URL, headers=HEADERS, json=payload)

        if response.status_code == 200:
            # Process successful response
            result = response.json()
            generated_text = result[0]["generated_text"]

            # Clean the response text
            cleaned_response = clean_response(generated_text, is_info_request)

            return {"response": cleaned_response}
        else:
            # Handle API errors
            return {
                "response": f"Error: Unable to get a response from the language model. Status code: {response.status_code}"
            }
    except Exception as e:
        # Handle any other exceptions
        return {"response": f"Error processing your request: {str(e)}"}


@app.get("/current-diagnosis")
async def get_current_diagnosis():
    """
    Endpoint to retrieve the current diagnosis information

    Returns the classification result, confidence score, and body part
    of the most recent diagnosis
    """
    global diagnosis
    return {
        "classification_result": diagnosis.get_full_description(),
        "confidence_score": round(diagnosis.confidence_score * 100, 2),
        "body_part": diagnosis.body_part,
    }


# Start the FastAPI server when the script is run directly
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

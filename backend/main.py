from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np
import io
import re
import os
import requests
from dotenv import load_dotenv
from keras.models import load_model
import uvicorn

# Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

if not HUGGINGFACE_API_KEY:
    raise ValueError("🚨 Hugging Face API key is missing! Please check your .env file.")

# API Config
HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base"
HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

# Initialize app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
primary_model = load_model("Models_ai/RAy_not_Ray.h5")
nail_model = load_model("Models_ai/nail.h5")
chest_model = load_model("Models_ai/chest.h5")
Eye_model = load_model("Models_ai/Eye.h5")
skin_model = load_model("Models_ai/skin_1.h5")

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
    "Alzheimer": "Alzheimer",
}


# Diagnosis info class
class DiagnosisInfo:
    def __init__(self):
        self.classification_result = "Unknown"
        self.confidence_score = 0.0
        self.body_part = "Unknown"

    def update(self, classification, confidence, body_part="Unknown"):
        self.classification_result = classification
        self.confidence_score = confidence
        self.body_part = body_part

    def get_full_description(self):
        return (
            f"{self.classification_result} in {self.body_part}"
            if self.body_part != "Unknown"
            else self.classification_result
        )


diagnosis = DiagnosisInfo()


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    return np.expand_dims(np.array(image) / 255.0, axis=0)


@app.post("/predict/")
async def predict(file: UploadFile = File(...), bodyPart: str = Form("Chest")):
    global diagnosis
    try:
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        processed_img = preprocess_image(img)

        primary_pred = primary_model.predict(processed_img)
        primary_class_idx = np.argmax(primary_pred[0])
        primary_class = CLASS_NAMES["primary"][primary_class_idx]
        primary_confidence = float(np.max(primary_pred[0]))

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
            else:
                classification_result = "Unknown body part"
                confidence_score = 0.0

            diagnosis.update(classification_result, confidence_score, bodyPart)
        else:
            classification_result = "Not a valid X-ray image"
            confidence_score = primary_confidence
            diagnosis.update(classification_result, confidence_score)

        return {
            "classification_result": diagnosis.get_full_description(),
            "confidence_score": round(confidence_score * 100, 2),
            "body_part": diagnosis.body_part,
        }

    except Exception as e:
        return {"error": str(e)}


def clean_response(text, is_info_request=False):
    prompt_patterns = [
        r"You are a medical assistant\. Provide a detailed explanation about.*?Be concise but informative\.",
        r"You are a medical assistant\. The patient has been diagnosed with.*?Answer \(do not repeat the question in your answer\):",
        r"The patient has been diagnosed with.*?Answer the following question concisely and professionally:",
        r"Question:.*?\n",
    ]

    for pattern in prompt_patterns:
        text = re.sub(pattern, "", text, flags=re.DOTALL)

    if not is_info_request and "Answer:" in text:
        text = text.split("Answer:")[1].strip()

    lines = text.strip().split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)

    return "\n".join(lines).strip()


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(request: ChatRequest):
    global diagnosis

    if diagnosis.classification_result == "No abnormalities detected":
        return {
            "response": "🚨 The image you uploaded is not a valid x-ray. Please upload a medical x-ray so I can provide an accurate medical analysis."
        }

    is_info_request = request.message.startswith("Provide information")

    if is_info_request:
        disease_name = (
            request.message.replace("Provide information and treatments for", "")
            .replace("Provide information for", "")
            .strip()
        )

        if not disease_name or disease_name == diagnosis.classification_result:
            disease_name = diagnosis.get_full_description()

        prompt = (
            f"You are a medical assistant. Provide a detailed explanation about {disease_name}, "
            f"including its causes, symptoms, and available treatments. "
            f"At the end, provide a bullet-point list of 3-5 practical advice points or simple steps that patients "
            f"should follow. Format your response with clear sections for Description, Causes, Symptoms, Treatments, "
            f"and 'Advice for Patients' (as bullet points with • symbol). Be concise but informative."
        )
    else:
        prompt = (
            f"You are a medical assistant. The patient has been diagnosed with {diagnosis.get_full_description()} "
            f"(Confidence: {diagnosis.confidence_score:.2f}%).\n"
            f"Answer the following question concisely and professionally:\n"
            f"Question: {request.message}\n"
            "Answer (do not repeat the question in your answer):"
        )

    payload = {"inputs": prompt}

    try:
        response = requests.post(HF_API_URL, headers=HEADERS, json=payload)
        if response.status_code == 200:
            raw_output = response.json()[0]["generated_text"]
            return {"response": clean_response(raw_output, is_info_request)}
        elif response.status_code == 503:
            return {
                "error": "Model is loading or temporarily unavailable. Please try again in a few seconds."
            }
        else:
            return {
                "error": f"Unexpected error: {response.status_code}, {response.text}"
            }
    except Exception as e:
        return {"response": f"Error processing your request: {str(e)}"}


@app.get("/current-diagnosis")
async def get_current_diagnosis():
    global diagnosis
    return {
        "classification_result": diagnosis.get_full_description(),
        "confidence_score": round(diagnosis.confidence_score * 100, 2),
        "body_part": diagnosis.body_part,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

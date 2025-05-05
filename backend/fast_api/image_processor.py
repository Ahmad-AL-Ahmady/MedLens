from PIL import Image
import numpy as np
import io
from models import CLASS_NAMES, BODY_PART_TO_MODEL
from text_generator import get_medical_info

# Function to convert image to usable format
def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    return np.expand_dims(np.array(image) / 255.0, axis=0)

# Process an image for diagnosis
def process_diagnosis(image_data, body_part, models, diagnosis):
    img = Image.open(io.BytesIO(image_data)).convert("RGB")
    processed_img = preprocess_image(img)

    # Classify image using primary model
    primary_pred = models["primary"].predict(processed_img)
    primary_class_idx = np.argmax(primary_pred[0])
    primary_class = CLASS_NAMES["primary"][primary_class_idx]
    primary_confidence = float(np.max(primary_pred[0]))

    # Check body part and select appropriate model
    if primary_class == "Ray" and body_part in BODY_PART_TO_MODEL:
        model_key = BODY_PART_TO_MODEL[body_part]

        # Check if model is loaded
        if model_key in models:
            model_pred = models[model_key].predict(processed_img)
            result_idx = np.argmax(model_pred[0])
            classification_result = CLASS_NAMES[model_key][result_idx]
            confidence_score = float(np.max(model_pred[0]))
        else:
            classification_result = "Unknown body part"
            confidence_score = 0.0

        diagnosis.update(classification_result, confidence_score, body_part)

        # Automatically generate medical information after diagnosis
        if classification_result.lower() != "normal" and classification_result.lower() != "normal anatomy":
            # Only if there is a diagnosis of a disease or abnormal condition
            diagnosis.medical_info = get_medical_info(
                diagnosis.get_full_description(), models["llm"])
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
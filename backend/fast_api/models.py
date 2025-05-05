import os
from keras.models import load_model
from ctransformers import AutoModelForCausalLM

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

# Load GGML/GGUF language model
def load_language_model():
    MODEL_PATH = "Models_ai\\ggml-model-Q8_0.gguf"  # Make sure the path to the file is correct
    llm = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        model_type="llama",  # Specify model type (llama, gpt2, gpt-j, etc.)
        context_length=2048,  # Context window size (similar to n_ctx)
        threads=4  # Number of threads for processing - adjust according to your device
    )
    return llm

# Load local model (helper function)
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

# Load all required models
def load_all_models():
    print("Loading all models...")
    models = {
        "llm": load_language_model(),
        "primary": load_local_model("Models_ai/RAy_not_Ray.h5"),
        "nail": load_local_model("Models_ai/nail.h5"),
        "chest": load_local_model("Models_ai/chest.h5"),
        "Eye": load_local_model("Models_ai/Eye.h5"),
        "skin": load_local_model("Models_ai/skin_1.h5"),
        "bone": load_local_model("Models_ai/Bone.h5"),
        "kidney": load_local_model("Models_ai/kidney_cancer.h5"),
        "lung": load_local_model("Models_ai/lung_cancer_1.h5"),
        "brain": load_local_model("Models_ai/Brain_Tumor_1.h5"),
    }
    print("All models loaded successfully!")
    return models
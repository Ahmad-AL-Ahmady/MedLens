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

# إعداد FastAPI
app = FastAPI()

# تكوين CORS Middleware للسماح بالاتصالات من جميع المصادر
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# تحميل نموذج GGML/GGUF باستخدام ctransformers
MODEL_PATH = "Models_ai\\ggml-model-Q8_0.gguf"  # تأكد من وجود المسار الصحيح للملف
llm = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    model_type="llama",  # تحديد نوع النموذج (llama, gpt2, gpt-j, etc.)
    context_length=2048,  # حجم نافذة السياق (مماثل لـ n_ctx)
    threads=4  # عدد الخيوط للمعالجة - قم بضبطه وفقًا لجهازك
)


# تحميل النماذج المحلية (مثال لنماذج تصنيف الأشعة السينية)
def load_local_model(model_name: str):
    model_path = f"./{model_name}"
    if os.path.exists(model_path):
        print(f"Loading {model_name} from local storage...")
        return load_model(model_path)
    else:
        print(f"Model {model_name} not found locally. Downloading...")
        model = load_model(model_name)
        model.save(model_path)  # حفظ النموذج محليًا
        return model


# تحميل النماذج
primary_model = load_local_model("Models_ai/RAy_not_Ray.h5")
nail_model = load_local_model("Models_ai/nail.h5")
chest_model = load_local_model("Models_ai/chest.h5")
Eye_model = load_local_model("Models_ai/Eye.h5")
skin_model = load_local_model("Models_ai/skin_1.h5")
bone_model = load_local_model("Models_ai/Bone.h5")
kidney_model = load_local_model("Models_ai/kidney_cancer.h5")
lung_model = load_local_model("Models_ai/lung_cancer_1.h5")
brain_model = load_local_model("Models_ai/Brain_Tumor_1.h5")


# تعاريف الأسماء لكل تصنيف
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


# دالة لتحويل الصورة إلى شكل قابل للاستخدام
def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    return np.expand_dims(np.array(image) / 255.0, axis=0)


# فئة لتخزين معلومات التشخيص
class DiagnosisInfo:
    def __init__(self):
        self.classification_result = "Unknown"
        self.confidence_score = 0.0
        self.body_part = "Unknown"
        self.medical_info = ""  # إضافة حقل لتخزين المعلومات الطبية

    def update(self, classification, confidence, body_part="Unknown"):
        self.classification_result = classification
        self.confidence_score = confidence
        self.body_part = body_part
        # تفريغ المعلومات الطبية عند تحديث التشخيص
        self.medical_info = ""

    def get_full_description(self):
        return (
            f"{self.classification_result} in {self.body_part}"
            if self.body_part != "Unknown"
            else self.classification_result
        )


diagnosis = DiagnosisInfo()


# دالة لتوليد الاستجابة من نموذج ctransformers
def generate_response(prompt: str):
    # إعداد معلمات التوليد
    response = llm(
        prompt,
        max_new_tokens=512,
        temperature=0.7,
        top_p=0.95,
        stop=["Human:", "User:"]  # تحديد الكلمات التي تنهي الرد
    )

    # تنظيف الاستجابة من أي توجيهات غير مرغوبة
    cleaned_response = response.strip()

    # إزالة أي توجيهات مثل "Use appropriate language level..."
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

    # إزالة أي تنسيقات رمزية غير مرغوبة
    if cleaned_response.startswith("<"):
        # محاولة حذف أي وسوم XML أو HTML في بداية الاستجابة
        import re
        cleaned_response = re.sub(r"^<[^>]+>", "", cleaned_response).strip()

    return cleaned_response


# دالة جديدة للحصول على المعلومات الطبية تلقائيًا بعد التشخيص
def get_medical_info(condition_name):
    prompt = (
        f"Provide medical information about {condition_name}. "
        f"Include: Description, Causes, Symptoms, Treatments. "
        f"End with 3-5 practical advice points for patients as bullet points. "
        f"Be accurate and concise."
    )
    return generate_response(prompt)


# API للتنبؤ باستخدام نموذج الصور
@app.post("/predict/")
async def predict(file: UploadFile = File(...), bodyPart: str = Form("Chest")):
    global diagnosis
    try:
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data)).convert("RGB")
        processed_img = preprocess_image(img)

        # تصنيف الصورة باستخدام النموذج الأول
        primary_pred = primary_model.predict(processed_img)
        primary_class_idx = np.argmax(primary_pred[0])
        primary_class = CLASS_NAMES["primary"][primary_class_idx]
        primary_confidence = float(np.max(primary_pred[0]))

        # التحقق من جزء الجسم واختيار النموذج المناسب
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

            # توليد المعلومات الطبية بشكل تلقائي بعد التشخيص
            if classification_result.lower() != "normal" and classification_result.lower() != "normal anatomy":
                # فقط إذا كان هناك تشخيص لمرض أو حالة غير طبيعية
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

        # إضافة المعلومات الطبية للاستجابة إذا كانت متاحة
        if diagnosis.medical_info:
            response_data["medical_info"] = diagnosis.medical_info

        return response_data

    except Exception as e:
        return {"error": str(e)}


# فئة لتمثيل طلبات المحادثة مع النموذج
class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(request: ChatRequest):
    global diagnosis

    # ✅ رسالة ترحيب تلقائية عند استقبال start أو hello أو hi أو السلام عليكم
    if request.message.strip().lower() in ["start", "hello", "hi", "ابدأ", "مرحبا", "السلام عليكم"]:
        return {
            "response": "👋 Hello and welcome! I'm here to help answer your questions. Just ask away! 😊"
        }

    # التحقق من صلاحية صورة الأشعة
    if diagnosis.classification_result == "No abnormalities detected" or diagnosis.classification_result == "Not a valid x-ray image":
        return {
            "response": "🚨 The image you uploaded is not a valid x-ray. Please upload a medical x-ray so I can provide an accurate medical analysis."
        }

    # إذا المستخدم طلب معلومات طبية فقط
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

    # لو طلب معلومات محددة
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


# تشغيل السيرفر
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

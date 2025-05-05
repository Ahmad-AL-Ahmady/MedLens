from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from models import load_all_models
from image_processor import preprocess_image, process_diagnosis
from chat_handler import handle_chat_request
from schemas import ChatRequest, DiagnosisInfo

# Initialize global diagnosis object
diagnosis = DiagnosisInfo()

# Setup FastAPI
app = FastAPI()

# Configure CORS Middleware to allow connections from all sources
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load all models at startup
models = load_all_models()

# API for prediction using image model
@app.post("/predict/")
async def predict(file: UploadFile = File(...), bodyPart: str = Form("Chest")):
    global diagnosis
    try:
        image_data = await file.read()
        result = process_diagnosis(image_data, bodyPart, models, diagnosis)
        return result
    except Exception as e:
        return {"error": str(e)}

# API for chat with the model
@app.post("/chat")
async def chat(request: ChatRequest):
    global diagnosis
    return handle_chat_request(request, diagnosis)

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
from pydantic import BaseModel

# Class for representing chat requests with the model
class ChatRequest(BaseModel):
    message: str

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
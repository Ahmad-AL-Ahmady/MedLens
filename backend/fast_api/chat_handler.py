from text_generator import generate_response

# Handle chat requests
def handle_chat_request(request, diagnosis):
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
        from models import load_language_model
        llm = load_language_model()  # Load language model on demand
        disease_name = diagnosis.get_full_description()
        if not diagnosis.medical_info:
            prompt = (
                f"Provide medical information about {disease_name}. "
                f"Include: Description, Causes, Symptoms, Treatments. "
                f"End with 3-5 practical advice points for patients as bullet points. "
                f"Be accurate and concise."
            )
            response = generate_response(prompt, llm)
            diagnosis.medical_info = response
        else:
            response = diagnosis.medical_info
        return {"response": response}

    # If specific information is requested
    is_info_request = request.message.lower().startswith("provide information")

    if is_info_request:
        from models import load_language_model
        llm = load_language_model()  # Load language model on demand
        
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
        from models import load_language_model
        llm = load_language_model()  # Load language model on demand
        
        prompt = (
            f"Context: The patient has been diagnosed with {diagnosis.get_full_description()} "
            f"(Confidence: {diagnosis.confidence_score:.2f}%).\n"
            f"Question: {request.message}\n"
            "Answer:"
        )

    response = generate_response(prompt, llm)
    return {"response": response}
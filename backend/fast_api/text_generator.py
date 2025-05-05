import re

# Function to generate response from ctransformers model
def generate_response(prompt: str, llm):
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
        cleaned_response = re.sub(r"^<[^>]+>", "", cleaned_response).strip()

    return cleaned_response

# Function to get medical information about a condition
def get_medical_info(condition_name, llm):
    prompt = (
        f"Provide medical information about {condition_name}. "
        f"Include: Description, Causes, Symptoms, Treatments. "
        f"End with 3-5 practical advice points for patients as bullet points. "
        f"Be accurate and concise."
    )
    return generate_response(prompt, llm)
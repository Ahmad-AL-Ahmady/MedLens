import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reviews: [
    {
      id: 1,
      name: "Dr. Emily Richardson",
      title: "Chief of Medicine, Metro Hospital",
      feedback:
        "As someone who's been practicing medicine for over 15 years, I was initially skeptical about AI in healthcare. But MedLens has completely transformed how we diagnose and treat patients.The accuracy and speed of the AI diagnostics are remarkable, and the integrated appointment system has streamlined our entire practice.",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150",
      rating: "",
      time: "2 months ago",
    },
    {
      id: 2,
      name: "Dr. James Wilson",
      title: "Pediatrician",
      feedback:
        "The pediatric-specific features have been invaluable. Parents appreciate the detailed explanations and treatment plans.",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150",
    },
    {
      id: 3,
      name: "Dr. Maria Rodriguez",
      title: "Cardiologist",
      feedback:
        "The AI's ability to detect subtle patterns in cardiac readings has helped us catch potential issues earlier.",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150",
    },
    {
      id: 4,
      name: "Dr. Michael Chang",
      title: "General Practitioner",
      feedback:
        "The platform has reduced our administrative workload by 40%. Now we can focus more on patient care.",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150",
    },
  ],
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {},
});

export default feedbackSlice.reducer;

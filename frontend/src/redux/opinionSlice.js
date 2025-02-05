import { createSlice } from "@reduxjs/toolkit";
import person1 from "../assets/images/person1.jpg";
import person2 from "../assets/images/person2.jpg";
import person3 from "../assets/images/person3.jpg";
import person4 from "../assets/images/person4.jpg";
import person5 from "../assets/images/person5.jpg";
import person6 from "../assets/images/person6.jpg";
import person7 from "../assets/images/person7.jpg";

const initialState = {
  opinions: [
    {
      id: 1,
      name: "Robert Law",
      rating: "⭐⭐⭐⭐",
      text: "This website is incredibly user-friendly! Navigating through the sections is smooth, and I easily found the medical services I needed.",
      image: person1,
    },
    {
      id: 2,
      name: "Sarah Howard",
      rating: "⭐⭐⭐⭐⭐",
      text: "I love how informative and well-organized this platform is. The integration of AI for healthcare services is truly impressive!",
      image: person2,
    },
    {
      id: 3,
      name: "Robert Fox",
      rating: "⭐⭐⭐⭐",
      text: "Booking an appointment was quick.The website provides a seamless experience for patients looking for reliable healthcare solutions.",
      image: person3,
    },
    {
      id: 4,
      name: "Emily Johnson",
      rating: "⭐⭐⭐⭐⭐",
      text: "The design is clean and modern,making it easy to access various features.I appreciate the effort put into making healthcare more accessible online.",
      image: person4,
    },
    {
      id: 5,
      name: "John Smith",
      rating: "⭐⭐⭐",
      text: "The website takes too long to load. This delay can frustrate users and potentially drive them away from using the site.",
      image: person5,
    },
    {
      id: 6,
      name: "Sophia Williams",
      rating: "⭐⭐⭐⭐",
      text: "The AI-powered diagnostics are a brilliant addition.It's reassuring to have an advanced system assisting in medical analysis .",
      image: person6,
    },
    {
      id: 7,
      name: "Michael Brown",
      rating: "⭐⭐⭐⭐⭐",
      text: "Exceptional service and an innovative approach to healthcare. This website truly bridges the gap between patients and medical professionals!",
      image: person7,
    },
  ],
};

const opinionSlice = createSlice({
  name: "opinions",
  initialState,
  reducers: {},
});

export const selectOpinions = (state) => state.opinions.opinions;
export default opinionSlice.reducer;

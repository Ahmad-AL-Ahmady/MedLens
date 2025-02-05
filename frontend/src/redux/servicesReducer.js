import healingHealthcare from "../assets/images/healingHealthcare.jpg";
import wellnessSolution from "../assets/images/wellnessSolution.jpg";
import treatmentSuggestion from "../assets/images/treatmentSuggestion.jpg";
import advancedCare from "../assets/images/advancedCare.jpg";
import quickAppointment from "../assets/images/quickAppointment.jpg";

const initialState = [
  {
    id: 1,
    title: "Healing Healthcare",
    description:
      "A healthcare system or services that focus not only on treating diseases but also on promoting overall well-being and recovery.it is characterized by providing care, and holistic healing.",
    image: healingHealthcare,
    icon: "🌀 ",
  },
  {
    id: 2,
    title: "Wellness Solutions",
    description:
      "These solutions offer innovative, tailored approaches to enhance overall health and quality of life. They focus on physical and mental well-being, empowering individuals to achieve a balanced, healthier lifestyle.",
    image: wellnessSolution,
    icon: "💡",
  },
  {
    id: 3,
    title: "Treatment Suggestion",
    description:
      "Is a recommendation given by a healthcare professional, suggesting a specific treatment or method to help treat a health issue. This could include medications, therapies, exercises, or lifestyle changes, based on the individual’s specific health needs and goals.",
    image: treatmentSuggestion,
    icon: "🧪 ",
  },
  {
    id: 4,
    title: "Advanced Care",
    description:
      "Refers to advanced medical care that uses the latest technologies such as MRI, CT scans and advanced surgical procedures. It is provided for complex cases that require accurate diagnosis and specialized treatment.",
    image: advancedCare,
    icon: "🧬",
  },
  {
    id: 5,
    title: "Quick Appointment",
    description:
      "It allows users to easily book medical appointments by displaying a schedule to choose the right time, with instant updates, instant confirmation, and reminder notifications, making it easier to access timely healthcare.",
    image: quickAppointment,
    icon: "📋",
  },
];

const servicesReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default servicesReducer;

import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import Navbar from "./components/Navbar";
import Stats from "./components/Stats";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import BannerSection from "./components/BannerSection";
import Feedback from "./components/Feedback";
import Overview from "./components/Overview";
import RoleSelection from "./components/RoleSelection";
import Footer from "./components/Footer";

function App() {
  return (
    <Provider store={store}>
      <div>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <Stats />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <BannerSection />
        <Feedback />
        <Overview />
        <RoleSelection />
        <Footer />
      </div>
    </Provider>
  );
}

export default App;

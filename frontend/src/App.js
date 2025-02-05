import React from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Slider from "./components/Slider";
import { Provider } from "react-redux";
import store from "./redux/store";
import Services from "./components/Services";
import Stats from "./components/Stats";
import AboutUs from "./components/AboutUs";
import Facilities from "./components/Facilities";
import Opinion from "./components/Opinion";
import Footer from "./components/Footer";

function App() {
  return (
    <Provider store={store}>
      <div>
        <Header />
        <HeroSection />
        <Slider />
        <Stats />
        <Services />
        <AboutUs />
        <Facilities />
        <Opinion />
        <Footer />
      </div>
    </Provider>
  );
}

export default App;

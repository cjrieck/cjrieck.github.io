import React, {useEffect} from 'react';
import ReactGA from 'react-ga'
import technology from './img/feature-art/technology.png'
import phone from './img/feature-art/phone.png'
import messageBubbles from './img/feature-art/message-bubble.png'
import './App.css';
import FeatureSection from "./components/feature_section/feature-section";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import StickyHeader from "./components/sticky-header/sticky-header";
import BrandsList from "./components/brands-list/brands-list";

const GA_TRACKING_ID = "UA-40166119-1"

function App() {
  useEffect(() => {
    const devMode = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!devMode) {
      ReactGA.initialize(GA_TRACKING_ID)
      ReactGA.pageview("/")
    }
  }, [])

  return (
    <div className="App">
      <StickyHeader />
      <Header />
      <BrandsList />
      <FeatureSection
        id={0}
        title="Ideation and Creation"
        description="I’ve used many technologies over the years and have seen what works and what doesn’t. No matter what size you are and where you are in your process, I will help you formulate and execute on a plan that you can confidently scale and maintain."
        artworkSource={technology}
      />
      <FeatureSection
        id={1}
        title="Track Record of Success"
        description="Shipping a product is easy, but knowing what to ship can be hard. Effective user research is vital for success, so I take a user-first approach to product development in order to deliver successful and delightful solutions."
        artworkSource={phone}
      />
      <FeatureSection
        id={2}
        title="What Can You Expect?"
        description="I will bring my expertise in frontend mobile development, microservices and infrastructure, but I’m not “just the consultant.” I will be like any other member of the team and always act in my client’s best interest. "
        artworkSource={messageBubbles}
      />
      <Footer />
    </div>
  );
}

export default App;

import React, {useEffect} from 'react';
import {Route, Routes, useLocation, Navigate} from "react-router-dom";
import ReactGA from 'react-ga'
import Home from "./pages/home/home";
import PotpourriPrivacyPolicy from "./pages/apps/potpourri/privacy";

const GA_TRACKING_ID = "UA-40166119-1"

function App() {
  const devMode = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const location = useLocation()

  useEffect(() => {
    if (!devMode) {
      ReactGA.initialize(GA_TRACKING_ID)
      ReactGA.pageview("/")
    }
  }, [])

  useEffect(() => {
    if (!devMode) {
      ReactGA.pageview(location.pathname)
    }
  }, [location])

  // Handle hash navigation for old routes
  useEffect(() => {
    if (location.pathname === '/expertise') {
      window.location.hash = '#process';
      window.location.pathname = '/';
    } else if (location.pathname === '/projects') {
      window.location.hash = '#work';
      window.location.pathname = '/';
    }
  }, [location.pathname])

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expertise" element={<Home />} />
        <Route path="/projects" element={<Home />} />
        <Route path="/apps/potpourri/privacy" element={<PotpourriPrivacyPolicy />} />
      </Routes>
    </div>
  );
}

export default App;

import React, {useEffect} from 'react';
import {Route, Routes, useLocation} from "react-router-dom";
import ReactGA from 'react-ga'
import Home from "./pages/home/home";
import Expertise from "./pages/expertise/expertise";
import ProjectsPage from "./pages/projects/projects";

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

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expertise" element={<Expertise />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </div>
  );
}

export default App;

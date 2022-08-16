import React from "react";
import "../../theme.css"
import "./sticky-header.css"
import LetsTalkButton from "../lets_talk_button/lets_talk_button";

export default function StickyHeader() {
  const resumeLink = `${process.env.PUBLIC_URL}/Clayton_Rieck_Resume.pdf`
  return (
    <div className="sticky-header-container">
      <button
        className="home-button bold-text"
        onClick={() => {
          window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
        }}
      >
        Clayton Rieck
      </button>
      <div className="resource-links">
        <a
          className="resource semibold-text"
          href={resumeLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
        </a>
        <a
          className="resource semibold-text"
          href="https://www.linkedin.com/in/claytonrieck/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a
          className="resource semibold-text"
          href="https://github.com/cjrieck"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          className="resource semibold-text"
          href="https://twitter.com/ClaytonRieck"
          target="_blank"
          rel="noopener noreferrer"
        >
          Twitter
        </a>
      </div>
      <LetsTalkButton fontSize="1.25vmin" />
    </div>
  )
}
import React, {useState} from "react";
import "../../theme.css"
import "./sticky-header.css"
import menuIconCollapsed from "../../img/menu-icon-collapsed.png"
import menuIconExpanded from "../../img/menu-icon-expanded.png"
import LetsTalkButton from "../lets_talk_button/lets_talk_button"
import {useMediaQuery} from "react-responsive";

export default function StickyHeader() {
  const [menuCollapsed, setMenuCollapsed] = useState(true)

  const renderCompactResourceLinks = () => {
    return (
      <div className="resource-links-compact">
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
    )
  }

  const isMobile = useMediaQuery({ query: "screen and (max-device-width: 480px)" })
  const resumeLink = `${process.env.PUBLIC_URL}/Clayton_Rieck_Resume.pdf`
  const menuIcon = menuCollapsed ? <img src={menuIconCollapsed} className="menu-icon-image" alt="menu-button" /> : <img src={menuIconExpanded} className="menu-icon-image" alt="menu-button" />
  return (
    <div className="sticky-header-container sticky-position">
      <div className="sticky-header-bar">
        <button
          className="menu-icon"
          onClick={() => {
            setMenuCollapsed(prevState => !prevState)
          }}
        >
          {menuIcon}
        </button>
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
        <LetsTalkButton fontSize={isMobile ? "1.25vmax" : "1.25vmin"} />
      </div>
      { menuCollapsed ? null : renderCompactResourceLinks() }
    </div>
  )
}
import React, {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import "../../theme.css"
import "./sticky-header.css"
import menuIconCollapsed from "../../img/menu-icon-collapsed.png"
import menuIconExpanded from "../../img/menu-icon-expanded.png"
import ActionButton from "../action-button/action-button"
import {useMediaQuery} from "react-responsive";

export default function StickyHeader() {
  const [menuCollapsed, setMenuCollapsed] = useState(true)
  const location = useLocation()

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
        <div className="header-element menu-icon-container">
          <button
            className="menu-icon"
            onClick={() => {
              setMenuCollapsed(prevState => !prevState)
            }}
          >
            {menuIcon}
          </button>
        </div>
        <div className="header-element">
          <Link
            to="/"
            className="home-button bold-text"
            onClick={() => {
              if (location.pathname === "/") {
                window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
              }
            }}
          >
            Clayton Rieck
          </Link>
        </div>
        <div className="header-element resource-links">
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
        <div className="header-element lets-talk-header-button">
          <ActionButton title="Let's Talk" routeName="mailto:cjrieck123@gmail.com" fontSize={isMobile ? "1.6vmax" : "0.8vmax"} />
        </div>
      </div>
      { menuCollapsed ? null : renderCompactResourceLinks() }
    </div>
  )
}
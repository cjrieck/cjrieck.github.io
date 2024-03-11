import React from "react";
import "../../theme.css"
import "./header.css"
import personalPhoto from '../../img/personal-photo.png'

export default function Header() {
  return (
    <div className="header-container container-content" id="top">
      <div className="text-container">
        <div className="greeting-text">
          Hi there!
        </div>
        <div className="name-text bold-text">
          I'm Clayton
        </div>
        <div className="about-me-text">
          Software Engineer and Entrepreneur with over a decade of experience developing frontends, backends, teams and companies
        </div>
      </div>
      <img src={personalPhoto} className="personal-photo" alt="portrait"/>
    </div>
  )
}
import React from "react";
import "../../theme.css"
import "./footer.css"
import ActionButton from "../action-button/action-button";

export default function Footer() {
  return (
    <div className="footer-container">
      <div className="bold-text footer-title">
        Want to learn more?
      </div>
      <div className="regular-text footer-description">
        Interested in learning more about me and what I can do for you? Feel free to send me an email! I’m really looking forward to getting to know you.
      </div>
      <ActionButton title="Let's Talk" routeName="mailto:cjrieck123@gmail.com"/>
      <div className="foot-notes">
        <div>Designed and developed with <span>&#10084;</span></div>
      </div>
    </div>
  )
}

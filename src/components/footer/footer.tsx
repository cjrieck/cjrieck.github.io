import React from "react";
import "../../theme.css"
import "./footer.css"
import LetsTalkButton from "../lets_talk_button/lets_talk_button";

export default function Footer() {
  return (
    <div className="footer-container">
      <div className="bold-text footer-title">
        Want to learn more?
      </div>
      <div className="regular-text footer-description">
        Interested in learning more about me and what I can do for you? Feel free to send me an email! I’m really looking forward to getting to know you.
      </div>
      <LetsTalkButton />
      <div className="foot-notes">
        <div>Designed an developed with <span>&#10084;</span></div>
      </div>
    </div>
  )
}

import React from "react";
import "../../theme.css"
import "./lets_talk_button.css"

type Props = {
  fontSize?: string | number
}

export default function LetsTalkButton({ fontSize }: Props) {
  return (
    <a
      className="lets-talk-link"
      href="mailto:cjrieck123@gmail.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="button-content semibold-text" style={{fontSize}}>
        Let's talk
      </div>
    </a>
  )
}
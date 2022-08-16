import React from "react";
import "../../theme.css"
import "./feature-section.css"

type Props = {
  id: number
  title: string
  description: string
  artworkSource: string
}

export default function FeatureSection(props: Props) {
  const textElement = (
    <div className="feature-text">
      <div className="feature-title bold-text">
        {props.title}
      </div>
      <div className="feature-description regular-text">
        {props.description}
      </div>
    </div>
  )
  const artworkElement = (
    <img src={props.artworkSource} className="feature-art" alt="feature-art"/>
  )

  const backgroundColor = props.id % 2 === 0 ? "#302D3F" : "#2A2736"
  const leftElement = props.id % 2 === 0 ? textElement : artworkElement
  const rightElement = props.id % 2 === 0 ? artworkElement : textElement
  return (
    <div className="feature-container container-content" style={{backgroundColor}}>
      {leftElement}
      {rightElement}
    </div>
  )
}

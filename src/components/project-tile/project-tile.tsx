import React from "react";
import "./project-tile.css"
import "../../theme.css"

type Props = {
  title: string
  description: string
  imagePath: string
}

export default function ProjectTile({title, description, imagePath}: Props) {
  return (
    <div className="project-tile-container">
      <img src={imagePath} className="project-tile-image" alt="project-image"/>
      <div className="project-tile-text">
        <div className="project-tile-title bold-text">{title}</div>
        <div className="project-tile-description regular-text">{description}</div>
      </div>
    </div>
  )
}
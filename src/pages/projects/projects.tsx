import React from "react";
import "./projects.css"
import "../../theme.css"
import soundcloudProjectImage from "../../img/projects/soundcloud.png"
import nogginProjectImage from "../../img/projects/noggin.png"
import nbcProjectImage from "../../img/projects/nbc.png"
import peachiProjectImage from "../../img/projects/peachi.png"
import StickyHeader from "../../components/sticky-header/sticky-header";
import ProjectTile from "../../components/project-tile/project-tile";
import ActionButton from "../../components/action-button/action-button";

export default function ProjectsPage() {
  const projects = [
    {
      title: "SoundCloud",
      description: "Developed and shipped monetization products including new ad products and SoundCloud Go and Go+",
      imagePath: soundcloudProjectImage,
    },
    {
      title: "Noggin",
      description: "Developed and launched a first-to-market subscription streaming service for Nickelodeon revitalizing the Noggin brand",
      imagePath: nogginProjectImage,
    },
    {
      title: "NBCUniversal",
      description: "Developed the mobile apps and backend for several NBCU brands including, but not limited to, USA, SyFy, Bravo, E!,  and Telemundo",
      imagePath: nbcProjectImage,
    },
    {
      title: "Peachi",
      description: "First of its kind fashion marketplace utilizing a user’s unique style profile to provide outfit inspiration and inspired shopping",
      imagePath: peachiProjectImage,
    }
  ]
  return (
    <div className="projects-container">
      <StickyHeader />
      <div className="projects-content-container">
        <div className="projects-header-text-container">
          <div className="projects-page-title bold-text">
            My Work
          </div>
          <div className="projects-page-description regular-text">
            I’ve worked across many different industries from media streaming to fintech. Here are just a few of the many projects I’ve worked on.
          </div>
        </div>
        <div className="projects-grid">
          { projects.map(projectTileProps => <ProjectTile {...projectTileProps} />) }
        </div>
        <div className="projects-page-footer">
          <div className="projects-page-footer-title bold-text">
            And many more...
          </div>
          <div className="projects-page-footer-description regular-text">
            Feel free to contact me and we can discuss how my experience can help you
          </div>
          <ActionButton title="Let's Talk" routeName="mailto:cjrieck123@gmail.com" />
        </div>
      </div>
    </div>
  )
}

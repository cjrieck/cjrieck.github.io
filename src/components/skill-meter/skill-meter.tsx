import React, {useState} from "react"
import VisibilitySensor from "react-visibility-sensor"
import GradientSVG from "../gradient-svg/gradient-svg";
import {CircularProgressbarWithChildren} from "react-circular-progressbar";
import "./skill-meter.css"
import "../../theme.css"

export enum Proficiency {
  EXPERT = "Expert",
  HIGHLY_PROFICIENT = "Highly Proficient",
  PROFICIENT = "Proficient",
  MIXED = "Mixed"
}

type Props = {
  name: string
  proficiency: Proficiency
  logo: string
  percentage: number
}

export default function SkillMeter({name, proficiency, logo, percentage}: Props) {
  const [gridBecameVisible, setGridBecameVisible] = useState(false)
  return (
    <div className="skill-meter-container">
      <GradientSVG
        startColor="#A6E8FF"
        endColor="#B280F5"
        idCSS="progress-gradient"
        rotation="0"
      />
      <div className="skill-name bold-text">
        {name}
      </div>
      <VisibilitySensor active={!gridBecameVisible}>
        {({ isVisible }: { isVisible: boolean }) => {
          const animatedPercentage = isVisible ? percentage : 0;
          if (isVisible) {
            setGridBecameVisible(true)
          }
          return (
            <CircularProgressbarWithChildren className="skill-meter-progressbar" value={animatedPercentage}>
              <img src={logo} className="technology-logo" alt="tech-logo"/>
            </CircularProgressbarWithChildren>
          );
        }}
      </VisibilitySensor>
      <div className="skill-proficiency regular-text">
        {proficiency}
      </div>
    </div>
  )
}

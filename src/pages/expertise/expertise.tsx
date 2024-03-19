import React from "react";
import StickyHeader from "../../components/sticky-header/sticky-header";
import "./expertise.css"
import "../../theme.css"
import processDiagram from "../../img/expertise/process-diagram.png"
import swiftLogo from "../../img/expertise/technology-logos/swift.png"
import swiftuiLogo from "../../img/expertise/technology-logos/swiftui.png"
import reactNativeLogo from "../../img/expertise/technology-logos/react-native.png"
import typescriptLogo from "../../img/expertise/technology-logos/typescript.png"
import pythonLogo from "../../img/expertise/technology-logos/python.png"
import miscLogo from "../../img/expertise/technology-logos/misc.png"
import SkillMeter, {Proficiency} from "../../components/skill-meter/skill-meter";
import ActionButton from "../../components/action-button/action-button";

export default function Expertise() {
  return (
    <div className="expertise-container">
      <StickyHeader />
      <div className="expertise-content">
        <div className="expertise-section">
          <div className="expertise-section-text">
            <div className="expertise-section-title bold-text">
              {"Minimum Viable Products to\nMaximum Value Products"}
            </div>
            <div className="expertise-section-description regular-text">
              My approach is data-driven, iterative and high impact. I facilitate swift iterations with a focus on Minimum Viable Products (MVPs) bolstered by heavy user validation and further elevated through a deep understanding of user data. Lets create something astonishing.
            </div>
          </div>
          <div className="process-diagram-section">
            <img src={processDiagram} className="process-diagram-image" alt="process-diagram"/>
            <ol className="process-steps bold-text">
              <li>
                User Research
              </li>
              <li>
                Development Iterations
              </li>
              <li>
                Deployment
              </li>
            </ol>
          </div>
        </div>
        <div className="expertise-section">
          <div className="expertise-section-text">
            <div className="expertise-section-title bold-text">
              {"Technology For Today\nand Tomorrow"}
            </div>
            <div className="expertise-section-description regular-text">
              I utilize modern tools and processes fit for today’s modern applications. I will help you find and create the best solution for your needs.
            </div>
          </div>
          <div className="skills-grid">
            <SkillMeter
              name="Swift"
              logo={swiftLogo}
              percentage={90}
              proficiency={Proficiency.EXPERT}
            />
            <SkillMeter
              name="SwiftUI"
              logo={swiftuiLogo}
              percentage={85}
              proficiency={Proficiency.EXPERT}
            />
            <SkillMeter
              name="React Native"
              logo={reactNativeLogo}
              percentage={70}
              proficiency={Proficiency.HIGHLY_PROFICIENT}
            />
            <SkillMeter
              name="Typescript"
              logo={typescriptLogo}
              percentage={70}
              proficiency={Proficiency.HIGHLY_PROFICIENT}
            />
            <SkillMeter
              name="Python"
              logo={pythonLogo}
              percentage={55}
              proficiency={Proficiency.PROFICIENT}
            />
            <SkillMeter
              name="Other*"
              logo={miscLogo}
              percentage={65}
              proficiency={Proficiency.MIXED}
            />
          </div>
          <div className="skills-disclaimer">
            * Note that this is not a full representation of the technologies and services I can provide. Please contact me and/or refer to my CV for futher info
          </div>
        </div>
        <div className="expertise-page-footer">
          <div className="expertise-page-footer-title bold-text">
            Want to learn more?
          </div>
          <div className="expertise-page-footer-description regular-text">
            Feel free to contact me and we can discuss how my experience can help you
          </div>
          <ActionButton title="Let's Talk" routeName="mailto:cjrieck123@gmail.com" />
        </div>
      </div>
    </div>
  )
}
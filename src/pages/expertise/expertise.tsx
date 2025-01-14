import StickyHeader from "../../components/sticky-header/sticky-header";
import "./expertise.css"
import "../../theme.css"
import researchIcon from "../../img/expertise/research-icon.png"
import iterationsIcon from "../../img/expertise/iterations-icon.png"
import deploymentIcon from "../../img/expertise/deployment-icon.png"
import swiftLogo from "../../img/expertise/technology-logos/swift.png"
import swiftuiLogo from "../../img/expertise/technology-logos/swiftui.png"
import reactNativeLogo from "../../img/expertise/technology-logos/react-native.png"
import typescriptLogo from "../../img/expertise/technology-logos/typescript.png"
import pythonLogo from "../../img/expertise/technology-logos/python.png"
import miscLogo from "../../img/expertise/technology-logos/misc.png"
import SkillMeter, {Proficiency} from "../../components/skill-meter/skill-meter";
import ActionButton from "../../components/action-button/action-button";
// import SkillChart from "../../components/skill-chart/skill-chart";
// import ImageCollage from "../../components/skill-collage/skill-collage";

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
          </div>
          <div className="process-diagram-section">
            <div className="process-steps bold-text">
              <div className="process-step">
                <img src={researchIcon} className="step-icon" alt="research-icon"/>
                <div className="step-text">
                  <div className="step-title">Data-Driven Decisions</div>
                  <div className="step-description regular-text">Understanding your users' needs through research and analytics</div>
                </div>
              </div>

              <div className="process-step">
                <img src={iterationsIcon} className="step-icon" alt="iterations-icon"/>
                <div className="step-text">
                  <div className="step-title">Development Iterations</div>
                  <div className="step-description regular-text">Rapid prototyping and continuous improvement based on feedback</div>
                </div>
              </div>

              <div className="process-step">
                <img src={deploymentIcon} className="step-icon" alt="deployment-icon"/>
                <div className="step-text">
                  <div className="step-title">Continuous Deployment</div>
                  <div className="step-description regular-text">Frequent delivery of polished solutions that scale with your success</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="expertise-section">
          <div className="expertise-section-text">
            <div className="expertise-section-title bold-text">
              {"Technology That Suits You"}
            </div>
          </div>
          {/* <div style={{width: '100%'}}>
            <ImageCollage images={[
              { src: swiftLogo, alt: 'Swift', width: 100, height: 100, x: 0, y: 0 },
              { src: swiftuiLogo, alt: 'SwiftUI', width: 100, height: 100, x: 0, y: 0 },
              { src: reactNativeLogo, alt: 'React Native', width: 100, height: 100, x: 0, y: 0 },
              { src: typescriptLogo, alt: 'TypeScript', width: 100, height: 100, x: 0, y: 0 },
              { src: pythonLogo, alt: 'Python', width: 100, height: 100, x: 0, y: 0 },
              { src: miscLogo, alt: 'Misc', width: 100, height: 100, x: 0, y: 0 },
            ]} />
          </div> */}
          {/* <SkillChart data={[
            { name: 'Swift', value: 100 },
            { name: 'SwiftUI', value: 100 },
            { name: 'React', value: 90 },
            { name: 'TypeScript', value: 90 },
            { name: 'Python', value: 80 },
            { name: 'Other*', value: 70 },
          ]} /> */}
          <div className="skills-grid">
            <SkillMeter
              name="Swift"
              logo={swiftLogo}
              percentage={100}
              proficiency={Proficiency.EXPERT}
            />
            <SkillMeter
              name="SwiftUI"
              logo={swiftuiLogo}
              percentage={100}
              proficiency={Proficiency.EXPERT}
            />
            <SkillMeter
              name="React Native"
              logo={reactNativeLogo}
              percentage={80}
              proficiency={Proficiency.HIGHLY_PROFICIENT}
            />
            <SkillMeter
              name="Typescript"
              logo={typescriptLogo}
              percentage={80}
              proficiency={Proficiency.HIGHLY_PROFICIENT}
            />
            <SkillMeter
              name="Python"
              logo={pythonLogo}
              percentage={70}
              proficiency={Proficiency.PROFICIENT}
            />
            <SkillMeter
              name="Other*"
              logo={miscLogo}
              percentage={70}
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
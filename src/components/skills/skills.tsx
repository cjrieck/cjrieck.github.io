import React from 'react';
import { stickerUrl } from '../../utils/assets';
import './skills.css';

const SKILLS = [
  { sticker: 'swift', alt: 'Swift logo', name: 'Swift', level: 'Expert', tone: 'l1' },
  { sticker: 'swiftui', alt: 'SwiftUI logo', name: 'SwiftUI', level: 'Expert', tone: 'l1' },
  { sticker: 'react-native', alt: 'React Native logo', name: 'React Native', level: 'Highly Proficient', tone: 'l2' },
  { sticker: 'typescript', alt: 'TypeScript logo', name: 'TypeScript', level: 'Highly Proficient', tone: 'l2' },
  { sticker: 'python', alt: 'Python logo', name: 'Python', level: 'Proficient', tone: 'l3' },
  { sticker: 'misc', alt: 'Other technologies', name: 'Other*', level: 'Mixed', tone: 'l4' },
];

export default function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="wrap">
        <header className="sh"><span className="label">Sticker sheet</span><h2>Technology That Suits You</h2></header>
        <div className="sheet">
          {SKILLS.map((skill) => (
            <div className="cell" key={skill.sticker}>
              <img src={stickerUrl(skill.sticker)} width="224" height="224" alt={skill.alt} />
              <div className="tag"><b>{skill.name}</b><span className={skill.tone}>{skill.level}</span></div>
            </div>
          ))}
        </div>
        <p className="note-fn">* Note that this is not a full representation of the technologies and services I can provide. Please contact me and/or refer to my CV for further info</p>
      </div>
    </section>
  );
}

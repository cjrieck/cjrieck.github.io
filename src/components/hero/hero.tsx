import React from 'react';
import { stickerUrl } from '../../utils/assets';
import './hero.css';

export default function Hero() {
  return (
    <section className="hero dots" id="top">
      <div className="wrap">
        <div>
          <h1>
            <span className="nametag">
              <span className="top" aria-hidden="true"><b>Hello</b><i>my name is</i></span>
              <span className="nm">Hi, I'm Clayton</span>
            </span>
            <span className="role">Software Engineer &amp;<em>Entrepreneur</em></span>
          </h1>
          <p>Over a decade of experience developing frontends, backends, teams, and companies. I build high-value, delightful solutions.</p>
          <div className="cta">
            <a className="btn" href="#work">See My Work</a>
            <a className="btn btn--paper" href="#process">My Process</a>
          </div>
        </div>
        <div className="pic">
          <img src={stickerUrl('personal-photo')} width="1000" height="1000" alt="Clayton smiling with arms crossed, wearing a black hoodie" />
          <svg className="star" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 6l13 27 30 4-22 21 6 30-27-15-27 15 6-30L7 37l30-4z" fill="#ec4a2c" stroke="#1b1626" strokeWidth="5" strokeLinejoin="round" />
          </svg>
          <div className="cr" aria-hidden="true">CR</div>
        </div>
      </div>
    </section>
  );
}

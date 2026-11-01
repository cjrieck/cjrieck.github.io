import React from 'react';
import './contact.css';
import { trackOnce } from '../../utils/analytics';

const via = (v: string) => () => trackOnce('contact-clicked', { via: v });

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="envelope">
          <div className="env-top">
            <p className="from"><span>From</span>Clayton Rieck<br /><a href="mailto:cjrieck123@gmail.com" onClick={via('email')}>cjrieck123@gmail.com</a></p>
            <div className="post" aria-hidden="true"><div className="mark"></div><div className="stamp"><span>CR</span></div></div>
          </div>
          <div className="env-body">
            <h2>Ready to build something great?</h2>
            <p>Let's discuss how I can help bring your vision to life.</p>
            <a className="btn btn--xl" href="mailto:cjrieck123@gmail.com" onClick={via('email')}>Let's Talk</a>
            <ul className="chips">
              <li><a href={`${process.env.PUBLIC_URL}/Clayton_Rieck_Resume.pdf`} target="_blank" rel="noopener noreferrer" onClick={via('resume')}>Resume</a></li>
              <li><a href="https://www.linkedin.com/in/claytonrieck/" target="_blank" rel="noopener noreferrer" onClick={via('linkedin')}>LinkedIn &#8599;</a></li>
              <li><a href="https://github.com/cjrieck" target="_blank" rel="noopener noreferrer" onClick={via('github')}>GitHub &#8599;</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

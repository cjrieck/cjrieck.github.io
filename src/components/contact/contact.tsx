import React from 'react';
import './contact.css';

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="envelope">
          <div className="env-top">
            <p className="from"><span>From</span>Clayton Rieck<br /><a href="mailto:cjrieck123@gmail.com">cjrieck123@gmail.com</a></p>
            <div className="post" aria-hidden="true"><div className="mark"></div><div className="stamp"><span>CR</span></div></div>
          </div>
          <div className="env-body">
            <h2>Ready to build something great?</h2>
            <p>Let's discuss how I can help bring your vision to life.</p>
            <a className="btn btn--xl" href="mailto:cjrieck123@gmail.com">Let's Talk</a>
            <ul className="chips">
              <li><a href={`${process.env.PUBLIC_URL}/Clayton_Rieck_Resume.pdf`} target="_blank" rel="noopener noreferrer">Resume</a></li>
              <li><a href="https://www.linkedin.com/in/claytonrieck/" target="_blank" rel="noopener noreferrer">LinkedIn &#8599;</a></li>
              <li><a href="https://github.com/cjrieck" target="_blank" rel="noopener noreferrer">GitHub &#8599;</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

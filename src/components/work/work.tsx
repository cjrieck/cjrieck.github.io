import React from 'react';
import './work.css';

export default function Work() {
  return (
    <section className="work" id="work">
      <div className="wrap">
        <header className="sh">
          <span className="label">Drag the slider to take it apart</span>
          <h2>Selected Work</h2>
          <p>I've worked across many different industries from media streaming to fintech. Here are just a few of the many projects I've worked on.</p>
        </header>
        <div className="mat">
          <div id="work-teardown"></div>
        </div>
      </div>
    </section>
  );
}

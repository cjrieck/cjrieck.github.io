import React, { useEffect, useRef } from 'react';
import { PROJECT_IMAGE_BASE, projectData } from '../../data/projects';
import { mountTeardown } from '../teardown/teardown-engine';
import '../teardown/teardown.css';
import './work.css';

export default function Work() {
  const hint = useRef<HTMLSpanElement>(null);
  const teardown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = teardown.current;
    if (!el) return;
    // The hint only makes sense while the selected project has parts; it is set directly, with no state, so React never re-renders the engine's nodes
    const onSelect = (hasParts: boolean) => {
      if (hint.current) hint.current.style.visibility = hasParts ? 'visible' : 'hidden';
    };
    return mountTeardown(el, projectData, { imageBase: PROJECT_IMAGE_BASE, onSelect });
  }, []);

  return (
    <section className="work" id="work">
      <div className="wrap">
        <header className="sh">
          <span className="label" ref={hint}>Drag the slider to take it apart</span>
          <h2>Selected Work</h2>
          <p>I've worked across many different industries from media streaming to fintech. Here are just a few of the many projects I've worked on.</p>
        </header>
        <div className="mat">
          <div id="work-teardown" ref={teardown}></div>
        </div>
      </div>
    </section>
  );
}

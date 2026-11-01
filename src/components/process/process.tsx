import React, { useEffect, useRef } from 'react';
import { mountProcessBall } from './process-ball';
import './process.css';

const STEPS = [
  {
    number: '01',
    title: 'Discover & Define',
    text: "We start with 'Why'. Deep diving into user needs and business goals to define clear success metrics before writing a single line of code.",
    color: 'var(--tomato)',
    rot: '-1deg',
  },
  {
    number: '02',
    title: 'Architect & Plan',
    text: 'Blueprinting the solution. Selecting the right tech stack and designing a system architecture that balances speed with long-term stability.',
    color: 'var(--mustard)',
    rot: '1deg',
  },
  {
    number: '03',
    title: 'Agile Execution',
    text: 'Rapid, iterative development. Shipping functional builds early and often to gather feedback and continuously refine the product.',
    color: 'var(--mint)',
    rot: '-.8deg',
  },
  {
    number: '04',
    title: 'Launch & Evolve',
    text: 'Deployment is just the beginning. Monitoring performance, optimizing bottlenecks, and scaling based on real-world usage data.',
    color: 'var(--teal)',
    rot: '1.2deg',
  },
];

export default function Process() {
  const steps = useRef<HTMLDivElement>(null);

  useEffect(() => (steps.current ? mountProcessBall(steps.current) : undefined), []);

  return (
    <section className="proc" id="process">
      <div className="wrap">
        <header className="sh">
          <span className="label">Take a ticket</span>
          <h2>The Build Process</h2>
          <p>From concept to launch, a proven methodology for building products that matter.</p>
        </header>
        <div className="steps" ref={steps}>
          <div className="track" aria-hidden="true"></div>
          <div className="ball" aria-hidden="true"></div>
          {STEPS.map((step) => (
            <div className="step" key={step.number}>
              <span className="node" aria-hidden="true"></span>
              <article className="ticket" style={{ '--c': step.color, '--rot': step.rot } as React.CSSProperties}>
                <div className="stub">{step.number}</div>
                <div className="tbody">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

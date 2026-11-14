import React, { useEffect, useState } from 'react';
import './nav.css';

const LINKS = [
  ['top', 'Home'],
  ['philosophy', 'Philosophy'],
  ['process', 'Process'],
  ['skills', 'Skills'],
  ['work', 'Work'],
];

// The nav's current link follows whichever of these sections crosses the middle of the screen.
export default function Nav() {
  const [current, setCurrent] = useState('top');

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    LINKS.forEach(([id]) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="navwrap">
      <nav className="nav" aria-label="Main">
        <a className="mono" href="#top" aria-label="CR, back to top">CR</a>
        <ul>
          {LINKS.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={current === id ? 'true' : undefined}>{label}</a>
            </li>
          ))}
        </ul>
        <a className="btn" href="#contact">Let's Talk</a>
      </nav>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import './nav.css';

const LINKS = [
  ['top', 'Home'],
  ['philosophy', 'Philosophy'],
  ['process', 'Process'],
  ['skills', 'Skills'],
  ['work', 'Work'],
];

// How far (px) the page has to scroll before the header has fully folded into the menu button. Keep in step with `animation-range` in nav.css.
const MORPH_DISTANCE = 140;
// By this point the strip has faded out and the menu button takes over (the progress curve is at 0.4 here).
const COMPACT_AT = 60;
// The header only shrinks on phones. Keep in step with the media queries in nav.css.
const PHONE = '(max-width: 760px)';
// Taller than any iPhone status-bar strip (about 60px), so the canvas is mustard for as long as the strip can show it.
const TOP_ZONE = 100;

// The nav's current link follows whichever of these sections crosses the middle of the screen.
// The header is a fixed strip of label tape. On phones it shrinks into a small menu button as the page scrolls, driven directly by the scroll position (progress `--p`, 0 to 1); wider screens keep the full strip. The button unfolds into the same links, with Let's Talk as the last row.
// Where the browser supports scroll-driven animations, CSS follows the scroll position itself (data-scroll="css"). A scroll listener can only react after the page has already moved, which looks jerky in Safari on iOS, so the listener only writes `--p` as the fallback.
export default function Nav() {
  const [current, setCurrent] = useState('top');
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const row = rowRef.current;
    if (!root || !row) return;
    const phone = window.matchMedia(PHONE);
    // Reduced motion turns CSS animations off site-wide, but this is the page's own scroll position rather than motion, so those visitors take the listener path
    const cssDriven =
      typeof CSS !== 'undefined' &&
      CSS.supports?.('animation-timeline: scroll()') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (cssDriven) root.dataset.scroll = 'css';
    const update = () => {
      const y = window.scrollY;
      if (phone.matches && !cssDriven) {
        const t = Math.min(1, Math.max(0, y / MORPH_DISTANCE));
        root.style.setProperty('--p', (t * t * (3 - 2 * t)).toFixed(4));
      }
      setCompact(phone.matches && y > COMPACT_AT);
      // Near the top of the page the status-bar strip is not covered by page content, so Safari fills it with the canvas color (see nav.css)
      document.documentElement.classList.toggle('at-top', y < TOP_ZONE);
    };
    // crossing the breakpoint (rotating a phone, resizing a window) leaves the header whole again
    const onBreakpoint = () => {
      if (!phone.matches) root.style.removeProperty('--p');
      update();
    };
    // the strip's natural height (it wraps to two rows on phones) is what the box shrinks from
    const measure = () => root.style.setProperty('--ph', `${row.offsetHeight}px`);
    measure();
    update();
    window.addEventListener('scroll', update, { passive: true });
    phone.addEventListener('change', onBreakpoint);
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    resize?.observe(row);
    return () => {
      window.removeEventListener('scroll', update);
      phone.removeEventListener('change', onBreakpoint);
      resize?.disconnect();
      document.documentElement.classList.remove('at-top');
    };
  }, []);

  useEffect(() => {
    if (!compact) setOpen(false);
  }, [compact]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

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
    <>
      <div className="navfix" data-compact={compact} data-open={open} ref={rootRef}>
        <div className="navbox">
          <div className="navclip">
            <nav className="nav" aria-label="Main" ref={rowRef}>
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
          <button type="button" className="menu-btn" aria-label="Menu" aria-expanded={open} aria-controls="sections" onClick={() => setOpen((o) => !o)} ref={menuRef}>
            <span className="bars" aria-hidden="true" />
          </button>
          <nav className="menusheet" id="sections" aria-label="Sections">
            <ul>
              {LINKS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} aria-current={current === id ? 'true' : undefined} onClick={() => setOpen(false)}>{label}</a>
                </li>
              ))}
              <li className="menusheet-cta">
                <a className="btn" href="#contact" onClick={() => setOpen(false)}>Let's Talk</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

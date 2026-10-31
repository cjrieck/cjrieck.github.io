import React from 'react';
import './footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <span>&copy; {new Date().getFullYear()} Clayton Rieck</span>
        <a href="#top">Back to top &#8593;</a>
      </div>
    </footer>
  );
}

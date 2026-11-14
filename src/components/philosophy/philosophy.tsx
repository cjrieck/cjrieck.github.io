import React from 'react';
import './philosophy.css';

export default function Philosophy() {
  return (
    <section className="phil" id="philosophy">
      <div className="wrap">
        <header className="sh"><span className="label">Notes on the monitor</span><h2>How I Think</h2></header>
        <div className="notes">
          <article className="note n1">
            <i className="pin"></i>
            <h3>The Product Engineer</h3>
            <p>I don't just write code; I build solutions. I bridge the gap between complex engineering challenges and real-world business goals.</p>
          </article>
          <article className="note n2">
            <i className="tape"></i>
            <h3>Scalable Foundations</h3>
            <p>Architecture matters. I design robust systems built to grow with your success from day one.</p>
          </article>
          <article className="note n3">
            <i className="tape"></i>
            <h3>User-Obsessed</h3>
            <p>Performance is a feature. I craft pixel-perfect, accessible, and lightning-fast experiences.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

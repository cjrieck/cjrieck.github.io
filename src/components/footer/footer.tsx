import React, { useRef, useEffect, useState } from 'react';
import './footer.css';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { scaleHover } from '../../utils/animations';
import ActionButton from '../action-button/action-button';

// SVG Icons (inline for better control)
const LinkedInIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
  </svg>
);

// Animated gradient mesh background
function GradientMesh() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const springConfig = { damping: 30, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <div 
      ref={containerRef}
      className="gradient-mesh-container"
      onMouseMove={handleMouseMove}
    >
      {/* Animated gradient orbs */}
      <motion.div 
        className="gradient-orb orb-1"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div 
        className="gradient-orb orb-2"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      <motion.div 
        className="gradient-orb orb-3"
        style={{
          left: `calc(${smoothX.get() * 100}% - 100px)`,
          top: `calc(${smoothY.get() * 100}% - 100px)`,
        }}
      />
    </div>
  );
}

export default function Footer() {
  const resumeUrl = `${process.env.PUBLIC_URL || ''}/Clayton_Rieck_Resume.pdf`;

  return (
    <footer className="footer-container">
      {/* CTA Section with animated gradient mesh */}
      <motion.div
        className="footer-cta-section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px' }}
        transition={{ duration: 0.6 }}
      >
        <GradientMesh />
        
        <div className="footer-cta-content">
          <motion.h2 
            className="footer-cta-title bold-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to build something great?
          </motion.h2>
          <motion.p 
            className="footer-cta-description regular-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Let's discuss how I can help bring your vision to life.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ActionButton title="Let's Talk" routeName="mailto:cjrieck123@gmail.com" />
          </motion.div>
        </div>
        
        {/* Glowing border pulse */}
        <div className="footer-cta-border-glow" />
      </motion.div>

      {/* Utility Bar */}
      <motion.div
        className="footer-utility-bar"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '0px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="footer-copyright">© 2025 Clayton Rieck</div>
        
        <div className="footer-links-container">
          {/* Resume Button */}
          <motion.a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-resume-btn button-style"
            {...scaleHover}
            aria-label="View Resume"
          >
            Resume
          </motion.a>
          
          {/* Social Icons */}
          <div className="footer-social-icons">
            <motion.a
              href="https://www.linkedin.com/in/claytonrieck/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              whileHover={{ scale: 1.2, y: -3, color: '#0A66C2' }}
              aria-label="LinkedIn Profile"
            >
              <LinkedInIcon />
            </motion.a>
            <motion.a
              href="https://github.com/cjrieck"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              whileHover={{ scale: 1.2, y: -3, color: '#fff' }}
              aria-label="GitHub Profile"
            >
              <GitHubIcon />
            </motion.a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}

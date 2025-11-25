import React, { useState } from 'react';
import './hero.css';
import { motion } from 'framer-motion';
import { scrollToSection } from '../../utils/scroll';
import personalPhoto from '../../img/personal-photo.png';

// Animation variants for staggered text reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const wordVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    rotateX: -90,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

// Floating shapes component
const FloatingShapes = () => (
  <div className="floating-shapes">
    <motion.div
      className="floating-shape shape-1"
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <motion.div
      className="floating-shape shape-2"
      animate={{
        y: [0, 15, 0],
        x: [0, -15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 1,
      }}
    />
    <motion.div
      className="floating-shape shape-3"
      animate={{
        y: [0, -25, 0],
        rotate: [0, -180, -360],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2,
      }}
    />
    <motion.div
      className="floating-shape shape-4"
      animate={{
        y: [0, 20, 0],
        x: [0, 20, 0],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0.5,
      }}
    />
  </div>
);

export default function Hero() {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  // Split text into words for animation
  const titleLine1Words = ["Software", "Engineer"];
  const titleLine2Words = ["&", "Entrepreneur"];

  return (
    <section id="home" className="hero-section container-content">
      <FloatingShapes />
      
      <div className="hero-content">
        <motion.div 
          className="hero-text"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Animated greeting */}
          <motion.h2 
            className="greeting"
            variants={fadeInUp}
          >
            Hi, I'm Clayton
          </motion.h2>
          
          {/* Staggered word reveal for title */}
          <h1 className="main-title">
            <span className="title-line">
              {titleLine1Words.map((word, i) => (
                <motion.span 
                  key={`line1-${i}`} 
                  className="word-wrapper"
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="title-line text-gradient">
              {titleLine2Words.map((word, i) => (
                <motion.span 
                  key={`line2-${i}`} 
                  className="word-wrapper"
                  variants={wordVariants}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>
          
          <motion.p 
            className="hero-bio regular-text"
            variants={fadeInUp}
          >
            Over a decade of experience developing frontends, backends, teams, and companies. 
            I build high-value, delightful solutions.
          </motion.p>
          
          <motion.div 
            className="hero-actions"
            variants={fadeInUp}
          >
            <motion.a 
              href="#work" 
              className="primary-btn"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, 'work')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              See My Work
            </motion.a>
            <motion.a 
              href="#process" 
              className="secondary-btn"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, 'process')}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              My Process
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-image-container"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Animated morphing glow orb */}
          <motion.div 
            className="image-glow-orb"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              borderRadius: ['40%', '50%', '40%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div 
            className="image-glow-orb orb-secondary"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <motion.div 
            className={`image-wrapper glass-panel ${imageLoaded ? 'loaded' : 'loading'}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="image-skeleton" />
            <img 
              src={personalPhoto} 
              alt="Clayton Rieck" 
              className="hero-img"
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

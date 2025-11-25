import React from 'react';
import './portfolio.css';
import { motion } from 'framer-motion';
import { createFadeInUp } from '../../utils/animations';
import soundcloudProjectImage from '../../img/projects/soundcloud.png';
import nogginProjectImage from '../../img/projects/noggin.png';
import nbcProjectImage from '../../img/projects/nbc.png';
import peachiProjectImage from '../../img/projects/peachi.png';
import ProjectTile from '../project-tile/project-tile';

const projects = [
  {
    title: 'SoundCloud',
    description: 'Developed and shipped monetization products including new ad products and SoundCloud Go and Go+',
    imagePath: soundcloudProjectImage,
  },
  {
    title: 'Noggin',
    description: 'Developed and launched a first-to-market subscription streaming service for Nickelodeon revitalizing the Noggin brand',
    imagePath: nogginProjectImage,
  },
  {
    title: 'NBCUniversal',
    description: 'Developed the mobile apps and backend for several NBCU brands including, but not limited to, USA, SyFy, Bravo, E!, and Telemundo',
    imagePath: nbcProjectImage,
  },
  {
    title: 'Peachi',
    description: 'First of its kind fashion marketplace utilizing a user\'s unique style profile to provide outfit inspiration and inspired shopping',
    imagePath: peachiProjectImage,
  },
];

// Animated section title with staggered word reveal
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  
  return (
    <motion.h2
      className="section-title portfolio-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="title-word"
          variants={{
            hidden: { opacity: 0, y: 30, rotateX: -45 },
            visible: { 
              opacity: 1, 
              y: 0,
              rotateX: 0,
              transition: { 
                duration: 0.5, 
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </motion.h2>
  );
}

export default function Portfolio() {
  return (
    <section id="work" className="portfolio-section container-content">
      <motion.div
        className="portfolio-header"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
      >
        <AnimatedTitle text="Selected Work" />
        <motion.p 
          className="portfolio-description regular-text"
          {...createFadeInUp(0.3)}
        >
          I've worked across many different industries from media streaming to fintech. Here are just a few of the many projects I've worked on.
        </motion.p>
      </motion.div>
      
      <div className="portfolio-grid">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <ProjectTile {...project} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

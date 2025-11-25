import React from 'react';
import './philosophy.css';
import { motion } from 'framer-motion';
import { Lightbulb, Layers, Users } from 'lucide-react';
import { createFadeInUp } from '../../utils/animations';

const philosophyCards = [
  {
    id: 'main',
    icon: Lightbulb,
    title: 'The Product Engineer',
    description: "I don't just write code; I build solutions. I bridge the gap between complex engineering challenges and real-world business goals.",
    size: 'large',
  },
  {
    id: 'scalable',
    icon: Layers,
    title: 'Scalable Foundations',
    description: 'Architecture matters. I design robust systems built to grow with your success from day one.',
    size: 'small',
  },
  {
    id: 'user',
    icon: Users,
    title: 'User-Obsessed',
    description: 'Performance is a feature. I craft pixel-perfect, accessible, and lightning-fast experiences.',
    size: 'small',
  },
];

// Animated section title with staggered word reveal
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  
  return (
    <motion.h2
      className="section-title philosophy-title"
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

export default function Philosophy() {
  return (
    <section id="philosophy" className="philosophy-section container-content">
      <AnimatedTitle text="How I Think" />
      
      <div className="philosophy-bento">
        {philosophyCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              className={`philosophy-card glass-panel philosophy-card-${card.size}`}
              {...createFadeInUp(index * 0.15)}
            >
              {/* Animated gradient background for main card */}
              {card.size === 'large' && (
                <motion.div 
                  className="philosophy-card-glow"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              
              <div className="philosophy-card-icon">
                <IconComponent size={card.size === 'large' ? 40 : 28} strokeWidth={1.5} />
              </div>
              
              <h3 className={`philosophy-card-title bold-text ${card.size === 'large' ? 'gradient-text' : ''}`}>
                {card.title}
              </h3>
              
              <p className="philosophy-card-description regular-text">
                {card.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

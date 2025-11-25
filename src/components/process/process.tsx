import React, { useRef } from 'react';
import './process.css';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, PenTool, Code, Rocket } from 'lucide-react';
import { createFadeInUp } from '../../utils/animations';

const steps = [
  {
    id: 1,
    icon: Search,
    title: 'Discover & Define',
    description: "We start with 'Why'. Deep diving into user needs and business goals to define clear success metrics before writing a single line of code.",
  },
  {
    id: 2,
    icon: PenTool,
    title: 'Architect & Plan',
    description: 'Blueprinting the solution. Selecting the right tech stack and designing a system architecture that balances speed with long-term stability.',
  },
  {
    id: 3,
    icon: Code,
    title: 'Agile Execution',
    description: 'Rapid, iterative development. Shipping functional builds early and often to gather feedback and continuously refine the product.',
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Launch & Evolve',
    description: 'Deployment is just the beginning. Monitoring performance, optimizing bottlenecks, and scaling based on real-world usage data.',
  },
];

// Animated section title with staggered word reveal
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  
  return (
    <motion.h2
      className="section-title process-title"
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

export default function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"]
  });

  // Transform scroll progress to line height percentage
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="process-section container-content">
      <AnimatedTitle text="The Build Process" />
      
      <motion.p
        className="process-subtitle regular-text"
        {...createFadeInUp(0.1)}
      >
        From concept to launch, a proven methodology for building products that matter.
      </motion.p>

      <div className="process-timeline" ref={containerRef}>
        {/* The glowing line */}
        <div className="timeline-track">
          <motion.div 
            className="timeline-progress"
            style={{ height: lineHeight }}
          />
        </div>

        {/* Timeline steps */}
        <div className="timeline-steps">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.id}
                className="timeline-step"
                {...createFadeInUp(index * 0.15 + 0.2)}
              >
                {/* Node on the timeline */}
                <div className="timeline-node">
                  <span className="timeline-node-number">0{step.id}</span>
                </div>

                {/* Step card */}
                <div className="timeline-card glass-panel">
                  <div className="timeline-card-icon">
                    <IconComponent size={24} strokeWidth={1.5} />
                  </div>
                  <div className="timeline-card-content">
                    <h3 className="timeline-card-title bold-text">{step.title}</h3>
                    <p className="timeline-card-description regular-text">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

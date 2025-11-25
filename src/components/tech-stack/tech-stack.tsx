import React, { useRef, useState } from 'react';
import './tech-stack.css';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { fadeInUp } from '../../utils/animations';
import swiftLogo from '../../img/expertise/technology-logos/swift.png';
import swiftuiLogo from '../../img/expertise/technology-logos/swiftui.png';
import reactNativeLogo from '../../img/expertise/technology-logos/react-native.png';
import typescriptLogo from '../../img/expertise/technology-logos/typescript.png';
import pythonLogo from '../../img/expertise/technology-logos/python.png';
import miscLogo from '../../img/expertise/technology-logos/misc.png';

enum Proficiency {
  EXPERT = "Expert",
  HIGHLY_PROFICIENT = "Highly Proficient",
  PROFICIENT = "Proficient",
  MIXED = "Mixed"
}

interface Skill {
  name: string;
  logo: string;
  proficiency: Proficiency;
  size: 'large' | 'medium';
  color: string;
}

const skills: Skill[] = [
  {
    name: 'Swift',
    logo: swiftLogo,
    proficiency: Proficiency.EXPERT,
    size: 'large',
    color: '#F05138',
  },
  {
    name: 'SwiftUI',
    logo: swiftuiLogo,
    proficiency: Proficiency.EXPERT,
    size: 'large',
    color: '#0071E3',
  },
  {
    name: 'React Native',
    logo: reactNativeLogo,
    proficiency: Proficiency.HIGHLY_PROFICIENT,
    size: 'medium',
    color: '#61DAFB',
  },
  {
    name: 'TypeScript',
    logo: typescriptLogo,
    proficiency: Proficiency.HIGHLY_PROFICIENT,
    size: 'medium',
    color: '#3178C6',
  },
  {
    name: 'Python',
    logo: pythonLogo,
    proficiency: Proficiency.PROFICIENT,
    size: 'medium',
    color: '#3776AB',
  },
  {
    name: 'Other*',
    logo: miscLogo,
    proficiency: Proficiency.MIXED,
    size: 'medium',
    color: '#6366f1',
  },
];

// 3D Tilt Card Component
interface TiltCardProps {
  skill: typeof skills[0];
  index: number;
}

function TiltCard({ skill, index }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring config for smooth animation
  const springConfig = { damping: 20, stiffness: 300 };
  
  // Transform mouse position to rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

  // Glow position
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Normalize mouse position to -0.5 to 0.5
    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;
    
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Stagger the floating animation based on index
  const floatDelay = index * 0.5;

  return (
    <motion.div
      ref={cardRef}
      className={`tech-card glass-panel tech-card-${skill.size}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        '--skill-color': skill.color,
      } as React.CSSProperties}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Ambient glow - always visible, intensifies on hover */}
      <motion.div 
        className="tech-card-ambient-glow"
        style={{
          background: `radial-gradient(ellipse at center, ${skill.color}25 0%, transparent 70%)`,
        }}
        animate={{
          opacity: isHovered ? 0.9 : 0.5,
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Dynamic glow effect - follows mouse */}
      <motion.div 
        className="tech-card-glow"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${skill.color}45 0%, transparent 50%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      
      {/* Content with 3D lift */}
      <motion.div 
        className="tech-card-content"
        style={{ 
          transform: 'translateZ(30px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Floating logo with breathing animation */}
        <motion.div 
          className="tech-card-logo"
          animate={{
            y: [0, -8, 0],
            scale: isHovered ? 1.12 : 1,
          }}
          transition={{
            y: {
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: floatDelay,
            },
            scale: { duration: 0.3 },
          }}
          style={{
            filter: isHovered 
              ? `drop-shadow(0 0 30px ${skill.color})` 
              : `drop-shadow(0 0 12px ${skill.color}60)`,
          }}
        >
          <img src={skill.logo} alt={skill.name} />
        </motion.div>
        <h3 className="tech-card-name bold-text">{skill.name}</h3>
        <motion.span 
          className="tech-card-proficiency"
          style={{
            borderColor: `${skill.color}60`,
            background: `${skill.color}18`,
          }}
        >
          {skill.proficiency}
        </motion.span>
      </motion.div>
      
      {/* Shine effect on hover */}
      <motion.div 
        className="tech-card-shine"
        style={{
          opacity: isHovered ? 0.15 : 0,
          background: `linear-gradient(105deg, transparent 40%, ${skill.color}50 50%, transparent 60%)`,
        }}
      />
    </motion.div>
  );
}

// Animated section title component
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  
  return (
    <motion.h2
      className="section-title tech-stack-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="title-word"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5, delay: i * 0.1 }
            }
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </motion.h2>
  );
}

export default function TechStack() {
  return (
    <section id="skills" className="tech-stack-section container-content">
      <AnimatedTitle text="Technology That Suits You" />
      
      <div className="tech-stack-bento">
        {skills.map((skill, index) => (
          <TiltCard key={skill.name} skill={skill} index={index} />
        ))}
      </div>
      
      <motion.p
        className="tech-stack-disclaimer regular-text"
        {...fadeInUp}
      >
        * Note that this is not a full representation of the technologies and services I can provide. Please contact me and/or refer to my CV for further info
      </motion.p>
    </section>
  );
}

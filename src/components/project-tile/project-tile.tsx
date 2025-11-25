import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import "./project-tile.css"
import "../../theme.css"

type Props = {
  title: string
  description: string
  imagePath: string
}

export default function ProjectTile({title, description, imagePath}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position for spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring config for smooth magnetic effect
  const springConfig = { damping: 25, stiffness: 200 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  // Magnetic pull effect (subtle movement toward cursor)
  const magneticX = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), springConfig);
  const magneticY = useSpring(useTransform(mouseY, [0, 1], [-5, 5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    // Normalize to 0-1 range for spotlight position
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div 
      ref={cardRef}
      className="project-tile-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: magneticX,
        y: magneticY,
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      {/* Dynamic spotlight overlay */}
      <motion.div 
        className="project-tile-spotlight"
        style={{
          background: useTransform(
            [spotlightX, spotlightY],
            ([x, y]) => `radial-gradient(600px circle at ${Number(x) * 100}% ${Number(y) * 100}%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`
          ),
        }}
      />
      
      {/* Border glow that follows cursor */}
      <motion.div 
        className="project-tile-border-glow"
        style={{
          background: useTransform(
            [spotlightX, spotlightY],
            ([x, y]) => `radial-gradient(400px circle at ${Number(x) * 100}% ${Number(y) * 100}%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)`
          ),
        }}
      />
      
      <div className="project-tile-image-wrapper">
        <div className={`project-tile-skeleton ${imageLoaded ? 'hidden' : ''}`} />
        <img 
          src={imagePath} 
          className={`project-tile-image ${imageLoaded ? 'loaded' : ''}`} 
          alt={`${title} project`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Gradient overlay */}
        <div className="project-tile-overlay" />
        {/* Shine effect */}
        <div className="project-tile-shine" />
      </div>
      
      <div className="project-tile-text">
        <div className="project-tile-title bold-text">{title}</div>
        <div className="project-tile-description regular-text">{description}</div>
      </div>
    </motion.div>
  )
}

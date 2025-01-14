import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Image {
  src: string;
  alt?: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCollageProps {
  images: Image[];
}

export default function ImageCollage({ images }: ImageCollageProps) {
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.collage-container');
      if (container) {
        setContainerDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getRandomMotion = (imageWidth: number, imageHeight: number) => {
    if (containerDimensions.width === 0) return {};

    // Calculate maximum allowed positions while keeping image in bounds
    const maxX = containerDimensions.width - imageWidth;
    const maxY = containerDimensions.height - imageHeight;

    return {
      x: Math.random() * maxX,  // Ensures x position stays within bounds
      y: Math.random() * maxY,  // Ensures y position stays within bounds
      scale: 0.95 + Math.random() * 0.1,
      transition: {
        duration: 8 + Math.random() * 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror" as const
      }
    };
  };

  return (
    <div className="collage-wrapper">
      <div className="collage-container">
        {images.map((image, index) => {
          // const initialPos = getRandomPosition(image.width, image.height);
          const initialX = Math.random() % (containerDimensions.width - image.width);
          const initialY = Math.random() % (containerDimensions.height - image.height);
          return (
            <motion.div 
              key={index}
              className="collage-item"
              style={{
                // position: 'absolute',
                width: image.width,
                height: image.height
              }}
              initial={{ 
                // opacity: 0, 
                scale: 0.8,
                x: initialX,
                y: initialY
              }}
              animate={(containerDimensions.width > 0) ? {
                // opacity: 1,
                // scale: 1,
                ...getRandomMotion(image.width, image.height)
              } : {}}
              // whileHover={{ 
              //   scale: 1.1,
              //   zIndex: 10,
              //   transition: { duration: 0.3 }
              // }}
            >
              <img 
                src={image.src} 
                alt={image.alt || ''}
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
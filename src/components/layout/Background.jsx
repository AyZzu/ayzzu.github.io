import React from 'react';
import { motion } from 'framer-motion';
import logoGradient from '../../assets/logo-gradient.webp';
import logoMotionBlur from '../../assets/logo-motionblur.webp';
import logoMagenta from '../../assets/logo-magenta.webp';
import logoLilac from '../../assets/logo-lilac.webp';

const Background = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(#ECE6EE 1px, transparent 1px), linear-gradient(90deg, #ECE6EE 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Pink & Lilac ambient gradient blooms */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[450px] bg-pink50 rounded-full blur-[100px] opacity-70 will-change-transform"></div>
      <div className="absolute top-[35%] right-[-10%] w-[450px] h-[450px] bg-pink100 rounded-full blur-[90px] opacity-60 will-change-transform"></div>
      <div className="absolute bottom-[5%] left-[-10%] w-[550px] h-[550px] bg-lilac rounded-full blur-[120px] opacity-35 will-change-transform"></div>

      {/* Floating / Falling Geometric Logo Objects with GPU acceleration */}
      
      {/* 1. Large Top-Right Floating Object (Ambient Bokeh Blur) */}
      <motion.div 
        className="absolute -top-12 -right-16 w-80 md:w-96 opacity-35 filter blur-[2px] will-change-transform transform-gpu"
        animate={{
          y: [-20, 20, -20],
          x: [10, -10, 10],
          rotate: [-15, 12, -15],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={logoGradient} 
          alt="" 
          loading="lazy"
          decoding="async"
          width="384"
          height="384"
          className="w-full h-auto drop-shadow-[0_12px_24px_rgba(200,0,200,0.2)]" 
        />
      </motion.div>

      {/* 2. High-Velocity Motion Blur "Falling" Object (Mid-Left, tilted) */}
      <motion.div 
        className="absolute top-[32%] -left-12 w-64 md:w-80 opacity-45 filter blur-[1.5px] will-change-transform transform-gpu"
        animate={{
          y: [-35, 35, -35],
          x: [-12, 15, -12],
          rotate: [-28, -20, -28],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={logoMotionBlur} 
          alt="" 
          loading="lazy"
          decoding="async"
          width="320"
          height="320"
          className="w-full h-auto drop-shadow-[0_15px_30px_rgba(240,48,154,0.25)]" 
        />
      </motion.div>

      {/* 3. Deep Background Drifting Object (Center-Right) */}
      <motion.div 
        className="absolute top-[55%] right-[5%] w-72 md:w-88 opacity-25 filter blur-[4px] will-change-transform transform-gpu"
        animate={{
          y: [25, -25, 25],
          x: [-15, 15, -15],
          rotate: [45, 15, 45],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={logoLilac} 
          alt="" 
          loading="lazy"
          decoding="async"
          width="352"
          height="352"
          className="w-full h-auto" 
        />
      </motion.div>

      {/* 4. Sharp & Crisp Floating Foreground Object (Bottom-Left) */}
      <motion.div 
        className="absolute bottom-16 -left-8 w-52 md:w-64 opacity-40 will-change-transform transform-gpu"
        animate={{
          y: [15, -20, 15],
          rotate: [10, -15, 10],
          scale: [0.96, 1.04, 0.96]
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={logoMagenta} 
          alt="" 
          loading="lazy"
          decoding="async"
          width="256"
          height="256"
          className="w-full h-auto drop-shadow-[0_10px_20px_rgba(200,0,200,0.3)]" 
        />
      </motion.div>

      {/* 5. Fast Floating Accent Streak (Bottom-Right near Contact) */}
      <motion.div 
        className="absolute bottom-32 -right-8 w-44 md:w-56 opacity-35 filter blur-[2.5px] will-change-transform transform-gpu"
        animate={{
          y: [-25, 25, -25],
          x: [12, -12, 12],
          rotate: [-35, -45, -35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={logoMotionBlur} 
          alt="" 
          loading="lazy"
          decoding="async"
          width="224"
          height="224"
          className="w-full h-auto drop-shadow-[0_8px_20px_rgba(168,85,247,0.25)]" 
        />
      </motion.div>
    </div>
  );
};

export default Background;

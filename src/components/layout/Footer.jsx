import React from 'react';
import { motion } from 'framer-motion';
import logoIcon from '../../assets/logo-magenta.png';

const Footer = () => {
  return (
    <footer className="border-t border-line py-8 relative z-10 bg-page mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <img src={logoIcon} alt="MQST Logo" className="h-8 w-auto object-contain" />
          <div className="text-base font-display font-extrabold tracking-wider border-l-2 border-line pl-3 text-ink">MMFM</div>
        </div>
        
        <div className="text-xs font-medium text-muted text-center md:text-left">
          © {new Date().getFullYear()} Muhammad Muqsit Faiz Maulana (MQST). All rights reserved.
        </div>
        
        <div className="flex gap-4">
          {/* Social icons placeholder */}
          <div className="flex gap-3 text-muted">
            <span className="hover:text-magenta cursor-pointer transition-colors">B</span>
            <span className="hover:text-magenta cursor-pointer transition-colors">In</span>
            <span className="hover:text-magenta cursor-pointer transition-colors">Ig</span>
          </div>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs font-bold uppercase tracking-widest text-muted hover:text-magenta transition-colors ml-4"
          >
            TOP ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

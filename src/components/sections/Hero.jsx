import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, FileText, X, UploadCloud } from 'lucide-react';
import CvModal from './CvModal';
import { fetchCv } from '../../services/dataService';

const Hero = () => {
  const [cvData, setCvData] = useState(null);
  const [showCvModal, setShowCvModal] = useState(false);
  const [showNoCvModal, setShowNoCvModal] = useState(false);

  useEffect(() => {
    fetchCv().then(data => {
      if (data && data.cv_url) {
        setCvData(data);
      }
    });
  }, []);

  const handleViewCv = async () => {
    let current = cvData;

    // Fresh fetch check if not already loaded
    if (!current?.cv_url) {
      try {
        const data = await fetchCv();
        if (data && data.cv_url) {
          current = data;
          setCvData(data);
        }
      } catch {}
    }

    if (current && current.cv_url) {
      setShowCvModal(true);
    } else {
      setShowNoCvModal(true);
    }
  };

  const handleGoToAdmin = () => {
    setShowNoCvModal(false);
    window.history.pushState({}, '', '/admin');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section id="hero" className="relative pt-12 sm:pt-20 pb-10 sm:pb-16 flex flex-col items-center text-center px-2 sm:px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="inline-flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm border border-line mb-4 sm:mb-8 max-w-full overflow-hidden"
      >
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-magenta rounded-full shrink-0"></span>
        <span className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-ink truncate">GRAPHIC DESIGNER & VISUAL STRATEGIST</span>
        <span className="bg-line px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold text-muted ml-0.5 shrink-0">EST. 2017</span>
      </motion.div>

      <div className="relative inline-flex items-center justify-center max-w-full px-2">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-display text-[clamp(2.1rem,9vw,7rem)] font-extrabold leading-none tracking-tight sm:tracking-tighter mb-4 sm:mb-6 relative inline-block select-none max-w-full"
        >
          PORTO<span className="text-magenta">FOLIO</span>
          <span className="absolute -top-1 sm:-top-3 md:-top-4 -right-1.5 sm:-right-6 md:-right-8 text-xs sm:text-3xl md:text-5xl text-lilac/70 font-sans pointer-events-none select-none">'25</span>
        </motion.h1>
      </div>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl text-xs sm:text-base md:text-lg text-muted font-medium mb-6 sm:mb-10 leading-relaxed px-2"
      >
        Crafting bold brand identities, captivating packaging, and high-impact visual narratives 
        for forward-thinking creators, dynamic performance crews, and modern lifestyle brands.
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mb-8 sm:mb-16 w-full max-w-xs sm:max-w-none"
      >
        <a href="#works" className="w-full sm:w-auto bg-magenta text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-wide hover:bg-pink transition-all flex items-center justify-center gap-2 shadow-lg shadow-magenta/30 hover:shadow-magenta/50 text-xs sm:text-sm">
          VIEW PROJECTS <ArrowRight size={16} />
        </a>
        <button
          onClick={handleViewCv}
          className="w-full sm:w-auto bg-white border-2 border-magenta/40 text-magenta hover:bg-magenta hover:text-white hover:border-magenta px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-magenta/20 cursor-pointer text-xs sm:text-sm"
        >
          <FileText size={16} /> LIHAT CV
        </button>
        <a href="#contact" className="w-full sm:w-auto bg-white border border-line text-ink px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-wide hover:bg-page transition-all flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm">
          <Mail size={16} /> CONTACT ME
        </a>
      </motion.div>

      {/* Modal if CV is not uploaded yet */}
      <AnimatePresence>
        {showNoCvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-line p-6 sm:p-8 max-w-md w-full shadow-2xl text-left relative space-y-5 m-3"
            >
              <button
                onClick={() => setShowNoCvModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-page flex items-center justify-center text-muted hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-pink50 text-magenta flex items-center justify-center">
                <FileText size={24} />
              </div>

              <div>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-ink">
                  Berkas CV Belum Diunggah
                </h3>
                <p className="text-muted text-xs sm:text-sm mt-2 leading-relaxed">
                  File Curriculum Vitae (CV) belum diunggah oleh admin. Kamu dapat mengunggah berkas PDF / gambar CV kapan saja melalui <strong>Admin Studio CMS</strong>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGoToAdmin}
                  className="flex-1 bg-magenta text-white py-3 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-pink transition-all flex items-center justify-center gap-2 shadow-md shadow-magenta/20"
                >
                  <UploadCloud size={16} /> Buka Admin CMS
                </button>
                <button
                  onClick={() => setShowNoCvModal(false)}
                  className="py-3 px-5 rounded-2xl border border-line text-muted hover:text-ink font-bold text-xs uppercase tracking-wider hover:bg-page transition-all text-center"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-page Pop-up CV Preview Modal */}
      <CvModal 
        cvData={cvData} 
        isOpen={showCvModal} 
        onClose={() => setShowCvModal(false)} 
      />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8 w-full max-w-4xl"
      >
        <StatBadge icon="✦" number="4+ Years" text="GRAPHIC DESIGNING" />
        <StatBadge icon="★" number="50+ Shipped" text="VISUAL PROJECTS / BRANDS" />
        <StatBadge icon="●" number="Available" text="FOR FREELANCE WORK" color="text-success" />
      </motion.div>
    </section>
  );
};

const StatBadge = ({ icon, number, text, color = "text-magenta" }) => (
  <div className="bg-white p-4 sm:px-6 sm:py-4 rounded-2xl shadow-sm border border-line flex items-center gap-3 sm:gap-4">
    <div className={`text-xl sm:text-2xl ${color}`}>{icon}</div>
    <div className="text-left">
      <div className="font-bold text-lg sm:text-xl">{number}</div>
      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted font-bold">{text}</div>
    </div>
  </div>
);

export default Hero;

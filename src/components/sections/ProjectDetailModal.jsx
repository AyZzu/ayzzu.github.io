import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, User, Tag, Eye, ArrowRight, Sparkles, 
  ChevronLeft, ChevronRight, Layers, Maximize2 
} from 'lucide-react';

const ProjectDetailModal = ({ project, onClose }) => {
  // Safely extract and normalize images array
  const images = (() => {
    if (!project) return [];
    let list = [];
    if (Array.isArray(project.images)) {
      list = project.images;
    } else if (typeof project.images === 'string') {
      try {
        const parsed = JSON.parse(project.images);
        if (Array.isArray(parsed)) list = parsed;
      } catch {}
    }
    if (list.length === 0 && project.image_url) {
      list = [project.image_url];
    }
    return list.filter(u => typeof u === 'string' && u.trim().length > 0);
  })();

  const hasMultipleImages = images.length > 1;
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev

  // Reset active slide when project changes
  useEffect(() => {
    setActiveSlide(0);
    setDirection(0);
  }, [project]);

  // Keyboard navigation for carousel (only when multiple images exist) and escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (hasMultipleImages) {
        if (e.key === 'ArrowLeft') {
          setDirection(-1);
          setActiveSlide(prev => (prev > 0 ? prev - 1 : images.length - 1));
        } else if (e.key === 'ArrowRight') {
          setDirection(1);
          setActiveSlide(prev => (prev < images.length - 1 ? prev + 1 : 0));
        }
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, hasMultipleImages, images.length]);

  if (!project) return null;

  const handleNext = () => {
    if (!hasMultipleImages) return;
    setDirection(1);
    setActiveSlide(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    if (!hasMultipleImages) return;
    setDirection(-1);
    setActiveSlide(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 250 : -250,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' }
    },
    exit: (dir) => ({
      x: dir > 0 ? -250 : 250,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.25, ease: 'easeIn' }
    })
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-6 lg:p-8 select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-3xl sm:rounded-[2.5rem] border border-line shadow-2xl shadow-magenta/20 overflow-hidden flex flex-col my-auto"
        >
          {/* Top Header bar with close button */}
          <div className="p-4 sm:p-6 sm:px-8 border-b border-line flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2 sm:gap-3 truncate pr-2">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-magenta bg-pink50 px-2.5 sm:px-3 py-1 rounded-full border border-pink100 shrink-0">
                {project.category}
              </span>
              <span className="text-xs text-muted font-bold shrink-0">•</span>
              <span className="text-xs text-muted font-bold font-mono truncate">
                /{project.slug || 'work'}
              </span>
              {hasMultipleImages && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-muted bg-page px-2.5 py-1 rounded-full border border-line">
                  <Layers size={11} className="text-magenta" />
                  <span>{images.length} Slides Carousel</span>
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-page border border-line text-ink hover:text-magenta hover:border-magenta hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
              title="Tutup (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Image Artwork Showcase / Carousel */}
            <div className="space-y-3">
              <div className="w-full rounded-3xl overflow-hidden bg-slate-100 border border-line shadow-inner relative min-h-[300px] max-h-[540px] flex items-center justify-center group">
                {images.length > 0 ? (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-2 sm:p-4">
                    <AnimatePresence custom={direction} mode="wait">
                      <motion.img
                        key={hasMultipleImages ? activeSlide : 'single'}
                        custom={direction}
                        variants={hasMultipleImages ? slideVariants : undefined}
                        initial={hasMultipleImages ? "enter" : undefined}
                        animate={hasMultipleImages ? "center" : undefined}
                        exit={hasMultipleImages ? "exit" : undefined}
                        drag={hasMultipleImages ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset }) => {
                          if (hasMultipleImages) {
                            if (offset.x < -40) handleNext();
                            else if (offset.x > 40) handlePrev();
                          }
                        }}
                        src={images[activeSlide] || project.image_url}
                        alt={`${project.title} - Slide ${activeSlide + 1}`}
                        className={`w-full h-auto max-h-[500px] object-contain mx-auto rounded-2xl drop-shadow-sm select-none ${
                          hasMultipleImages ? 'cursor-grab active:cursor-grabbing' : ''
                        }`}
                      />
                    </AnimatePresence>

                    {/* Slide Counter Badge - ONLY SHOWN IF MULTIPLE IMAGES */}
                    {hasMultipleImages && (
                      <div className="absolute top-4 right-4 bg-ink/75 backdrop-blur-md text-white text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-1.5 z-10">
                        <span className="text-magenta">✦</span>
                        <span>{activeSlide + 1} / {images.length}</span>
                      </div>
                    )}

                    {/* Navigation Arrows for Carousel - STRICTLY ONLY SHOWN IF MULTIPLE IMAGES */}
                    {hasMultipleImages && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrev}
                          aria-label="Slide sebelumnya"
                          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-ink hover:text-magenta shadow-xl border border-line/60 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 cursor-pointer"
                        >
                          <ChevronLeft size={22} />
                        </button>

                        <button
                          type="button"
                          onClick={handleNext}
                          aria-label="Slide berikutnya"
                          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-ink hover:text-magenta shadow-xl border border-line/60 backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 cursor-pointer"
                        >
                          <ChevronRight size={22} />
                        </button>
                      </>
                    )}

                    {/* Pagination Dots - ONLY SHOWN IF MULTIPLE IMAGES */}
                    {hasMultipleImages && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-ink/50 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setDirection(i > activeSlide ? 1 : -1);
                              setActiveSlide(i);
                            }}
                            className={`h-1.5 rounded-full transition-all ${
                              activeSlide === i ? 'w-5 bg-magenta' : 'w-1.5 bg-white/50 hover:bg-white'
                            }`}
                            aria-label={`Ke slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-20 text-center text-magenta font-black text-2xl uppercase">
                    {project.title}
                  </div>
                )}
              </div>

              {/* Thumbnails Navigation Strip - STRICTLY ONLY SHOWN IF MULTIPLE IMAGES */}
              {hasMultipleImages && (
                <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-2 max-w-full">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDirection(idx > activeSlide ? 1 : -1);
                        setActiveSlide(idx);
                      }}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeSlide === idx
                          ? 'border-magenta shadow-md shadow-magenta/25 scale-105 ring-2 ring-magenta/30'
                          : 'border-line/70 opacity-60 hover:opacity-100 hover:border-magenta/50'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-ink/70 text-white font-extrabold text-[9px] px-1 rounded">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Metadata Header */}
            <div>
              <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-tight text-ink mb-4">
                {project.title}
              </h2>

              {/* Badges / Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted pt-2 border-t border-line/60">
                <div className="flex items-center gap-1.5 bg-page px-3 py-1.5 rounded-xl border border-line text-ink">
                  <User size={14} className="text-magenta" />
                  <span>Client: <strong>{project.client || 'Personal Project'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 bg-page px-3 py-1.5 rounded-xl border border-line text-ink">
                  <Calendar size={14} className="text-magenta" />
                  <span>Tahun: <strong>{project.year || '2025'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 bg-page px-3 py-1.5 rounded-xl border border-line text-ink">
                  <Eye size={14} className="text-magenta" />
                  <span>Views: <strong>{project.views ? project.views.toLocaleString() : '1,240'}</strong></span>
                </div>
              </div>
            </div>

            {/* Description Narrative */}
            <div className="bg-page/60 rounded-3xl p-6 sm:p-8 border border-line space-y-3">
              <h3 className="font-display font-extrabold text-lg text-ink flex items-center gap-2">
                <Sparkles size={16} className="text-magenta" />
                OVERVIEW &amp; CREATIVE CONCEPT
              </h3>
              <p className="text-muted text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
                {project.desc || 'Tidak ada deskripsi detail tambahan untuk project ini.'}
              </p>
            </div>

            {/* Tags Pills */}
            {(Array.isArray(project.tags) ? project.tags : []).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Tag size={13} className="text-magenta" /> PROJECT DELIVERABLES &amp; TAGS
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-line text-xs font-bold text-ink shadow-sm uppercase tracking-wider"
                    >
                      ✦ {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 sm:px-8 border-t border-line bg-page/40 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-muted font-medium">
              Curated by <strong>Muhammad Muqsit Faiz M.</strong>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#contact"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-magenta text-white font-bold text-xs uppercase tracking-wider hover:bg-pink transition-all shadow-md shadow-magenta/25 flex items-center gap-2"
              >
                <span>Inquire Similar Project</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ProjectDetailModal;

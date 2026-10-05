import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, User, Tag, Eye, ArrowRight, Sparkles 
} from 'lucide-react';

const ProjectDetailModal = ({ project, onClose }) => {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!project) return null;

  // Single primary image for fast rendering
  const displayImage = project.image_url || (Array.isArray(project.images) ? project.images[0] : '') || '';

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
            {/* Single Image Artwork Showcase (Fast, No Slide Lag) */}
            <div className="w-full rounded-3xl overflow-hidden bg-slate-100 border border-line shadow-inner relative min-h-[280px] max-h-[540px] flex items-center justify-center p-2 sm:p-4">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={project.title}
                  className="w-full h-auto max-h-[500px] object-contain mx-auto rounded-2xl drop-shadow-sm select-none"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="p-20 text-center text-magenta font-black text-2xl uppercase">
                  {project.title}
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

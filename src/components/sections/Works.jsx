import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectDetailModal from './ProjectDetailModal';
import { fetchWorks } from '../../services/dataService';

const filters = [
  "ALL", 
  "SOCIAL MEDIA POSTER", 
  "CATALOG PRODUCT BOOTH", 
  "PACKAGING DESIGN", 
  "FEEDS INSTAGRAM", 
  "LOGO DESIGN"
];

const Works = () => {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    setIsLoading(true);

    const loadProjects = async () => {
      try {
        const data = await fetchWorks();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Projects fetch error:', err);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Extract only categories that actually exist in uploaded projects
  const availableCategories = projects.reduce((acc, p) => {
    if (p.category && !acc.includes(p.category.trim())) {
      acc.push(p.category.trim());
    }
    return acc;
  }, []);

  const dynamicFilters = ['ALL', ...availableCategories];

  const filteredProjects = activeFilter === "ALL" 
    ? projects 
    : projects.filter(p => p.category?.toUpperCase() === activeFilter.toUpperCase());

  return (
    <section id="works" className="py-12 sm:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div>
          <div className="text-magenta font-bold tracking-widest text-xs uppercase mb-2">02 / PORTFOLIO SHOWCASE</div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-none">
            SELECTED<br />
            <span className="text-magenta">WORKS</span>
          </h2>
        </div>
        <p className="max-w-md text-muted font-medium text-xs sm:text-sm leading-relaxed border-l-2 border-magenta pl-4 sm:pl-6">
          Curated showcase spanning commercial packaging, virtual entertainment brand identities, and high-energy street dance campaigns.
        </p>
      </div>

      {/* Filter Tabs - only shows categories that actually exist */}
      {dynamicFilters.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {dynamicFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeFilter === filter 
                  ? "bg-magenta text-white shadow-md shadow-magenta/25" 
                  : "bg-white text-muted border border-line hover:border-magenta/50 hover:text-magenta"
              }`}
            >
              {filter === "ALL" ? `ALL (${projects.length.toString().padStart(2, '0')})` : filter}
            </button>
          ))}
        </div>
      )}

      {/* Loading or Empty State or Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-muted font-bold text-sm">
          Memuat data projects dari MySQL...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-line p-10 sm:p-14 text-center max-w-md mx-auto shadow-sm">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-ink">
            Belum Ada Project
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-white rounded-3xl overflow-hidden border border-line shadow-sm hover:shadow-xl hover:border-magenta/30 transition-all group flex flex-col cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink50 to-pink100 flex items-center justify-center text-magenta font-black uppercase tracking-widest text-sm px-6 text-center">
                      {project.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-magenta/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-magenta font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-md">
                      View Detail
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-magenta bg-pink50 px-2.5 py-1 rounded-md border border-pink100">
                      {project.category}
                    </div>
                    <div className="text-xs font-bold text-muted">{project.year || '2025'}</div>
                  </div>
                  
                  <h3 className="font-display font-bold text-xl leading-tight mb-3 group-hover:text-magenta transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-muted text-sm line-clamp-2 mb-6 font-medium flex-1">
                    {project.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {(Array.isArray(project.tags) ? project.tags : []).map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-muted border border-line px-2.5 py-1 rounded-md bg-page uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Full Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default Works;

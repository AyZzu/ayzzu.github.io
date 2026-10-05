import React, { useState } from 'react';
import { 
  Search, Plus, Download, SlidersHorizontal, Eye, ExternalLink, 
  Trash2, Edit3, Bell, CheckSquare, Square, Rocket, TrendingUp, MailCheck, LayoutGrid, List
} from 'lucide-react';
import avatarImg from '../../assets/mqst-avatar.webp';

const ProjectsList = ({ projects, onAddNew, onEditProject, onDeleteProject, onGoToPortfolio }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract only categories that actually exist in uploaded projects
  const categoryCounts = projects.reduce((acc, p) => {
    const cat = p.category ? p.category.trim() : 'OTHER';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const dynamicCategories = ['ALL', ...Object.keys(categoryCounts)];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = 
      selectedCategory === 'ALL' || 
      p.category?.toUpperCase() === selectedCategory.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-page min-h-screen">
      {/* Top Navbar */}
      <header className="h-20 bg-white border-b border-line px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search projects, assets, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-page border border-line rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onGoToPortfolio}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-page text-xs font-bold text-ink hover:text-magenta hover:border-magenta/50 transition-all"
          >
            <ExternalLink size={14} />
            <span>Live Portfolio</span>
          </button>

          <button className="p-2.5 rounded-xl border border-line bg-page text-muted hover:text-ink relative">
            <Bell size={16} />
            <span className="w-2 h-2 rounded-full bg-magenta absolute top-2 right-2"></span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-line">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-line">
              <img src={avatarImg} alt="MQST" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-extrabold text-ink hidden sm:block">MQST</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted mb-2">
              <span className="text-magenta font-black">STUDIO ARCHIVE CONTROL</span>
              <span>• CMS v2.4</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-none text-ink">
              PROJECTS &amp;<br />
              <span className="text-magenta">WORKS</span>
            </h1>
            <p className="text-muted text-sm font-medium mt-3 max-w-xl">
              Manage, organize, and publish curated studio artifacts, client commissions, and live case studies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAddNew}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-pink text-white text-xs font-extrabold tracking-wider uppercase hover:opacity-95 shadow-lg shadow-magenta/30 hover:shadow-magenta/50 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              <span>ADD NEW PROJECT</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="bg-white p-6 rounded-3xl border border-line shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by project title, client, or tags... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-page border border-line rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <select className="bg-page border border-line rounded-2xl px-4 py-3 text-xs font-bold text-ink focus:outline-none focus:border-magenta cursor-pointer">
                <option>All Status (Published, Draft, Archived)</option>
                <option>Published Only</option>
                <option>Draft Only</option>
              </select>

              <select className="bg-page border border-line rounded-2xl px-4 py-3 text-xs font-bold text-ink focus:outline-none focus:border-magenta cursor-pointer">
                <option>Sort: Newest First</option>
                <option>Sort: Most Views</option>
                <option>Sort: Title A-Z</option>
              </select>

              <div className="flex items-center p-1 bg-page border border-line rounded-2xl">
                <button className="p-2 rounded-xl bg-magenta text-white shadow-sm">
                  <List size={14} />
                </button>
                <button className="p-2 rounded-xl text-muted hover:text-ink">
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips - only shows existing categories */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-line/60">
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = cat === 'ALL' ? projects.length : (categoryCounts[cat] || 0);
              const label = cat === 'ALL' ? `ALL (${count})` : `${cat} (${count})`;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-magenta text-white shadow-md shadow-magenta/25'
                      : 'bg-page text-muted border border-line hover:border-magenta/40 hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table List of Projects */}
        <div className="bg-white rounded-3xl border border-line shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-page/50 text-[11px] font-extrabold uppercase tracking-widest text-muted">
                  <th className="py-4 px-6 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-muted hover:text-magenta">
                      {selectedIds.length === filteredProjects.length && filteredProjects.length > 0 ? (
                        <CheckSquare size={16} className="text-magenta" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4 w-28">MEDIA</th>
                  <th className="py-4 px-6">PROJECT TITLE &amp; SLUG</th>
                  <th className="py-4 px-6">CATEGORY</th>
                  <th className="py-4 px-6">CLIENT</th>
                  <th className="py-4 px-6">DATE ADDED</th>
                  <th className="py-4 px-6 text-right">VIEWS &amp; ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {paginatedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted font-medium text-sm">
                      Belum ada project yang cocok. Klik tombol <strong className="text-magenta">+ ADD NEW PROJECT</strong> untuk mengunggah karya pertama kamu!
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map((project) => {
                    const isSelected = selectedIds.includes(project.id);
                    return (
                      <tr 
                        key={project.id} 
                        className={`hover:bg-page/50 transition-colors group ${
                          isSelected ? 'bg-pink50/30' : ''
                        }`}
                      >
                        <td className="py-4 px-6 text-center">
                          <button onClick={() => toggleSelectOne(project.id)} className="text-muted hover:text-magenta">
                            {isSelected ? (
                              <CheckSquare size={16} className="text-magenta" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Media Thumbnail */}
                        <td className="py-4 px-4">
                          <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-line relative shrink-0">
                            {project.image_url ? (
                              <img 
                                src={project.image_url} 
                                alt={project.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-pink50 text-magenta font-black text-[10px] uppercase">
                                MQST
                              </div>
                            )}
                            {(() => {
                              let count = 0;
                              if (Array.isArray(project.images)) count = project.images.length;
                              else if (typeof project.images === 'string') {
                                try {
                                  const p = JSON.parse(project.images);
                                  if (Array.isArray(p)) count = p.length;
                                } catch {}
                              }
                              return count > 1 ? (
                                <span className="absolute bottom-1 right-1 bg-ink/85 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow">
                                  {count} Slides
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </td>

                        {/* Title & Slug */}
                        <td className="py-4 px-6">
                          <div className="font-display font-bold text-base text-ink group-hover:text-magenta transition-colors">
                            {project.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted font-mono mt-0.5">
                            <span>/{project.slug || 'work'}</span>
                            <ExternalLink size={11} className="text-muted" />
                            {project.status === 'Draft' && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 ml-1">
                                UNRELEASED
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="inline-block px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-pink50 text-magenta border border-pink100">
                            {project.category}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="py-4 px-6 font-medium text-xs text-ink">
                          {project.client || 'Personal Studio'}
                        </td>

                        {/* Date Added */}
                        <td className="py-4 px-6 text-xs text-muted font-medium">
                          {project.year || '2025'}
                        </td>

                        {/* Views & Actions (Edit + Delete) */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-muted mr-1">
                              <Eye size={13} className="text-magenta" />
                              {project.views ? project.views.toLocaleString() : '1,240'}
                            </span>
                            <button
                              onClick={() => onEditProject(project)}
                              title="Edit project"
                              className="p-2 rounded-xl text-muted hover:text-magenta hover:bg-pink50 border border-transparent hover:border-pink100 transition-all cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => onDeleteProject(project.id)}
                              title="Delete project"
                              className="p-2 rounded-xl text-muted hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Dynamic Pagination Footer */}
          <div className="p-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-muted">
            <div>
              Showing <strong className="text-ink">{filteredProjects.length === 0 ? 0 : startIndex + 1}</strong> to{' '}
              <strong className="text-ink">{Math.min(startIndex + itemsPerPage, filteredProjects.length)}</strong> of{' '}
              <strong className="text-ink">{filteredProjects.length}</strong> projects
            </div>

            {totalPages > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={validCurrentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-xl border border-line bg-page text-muted flex items-center justify-center hover:text-ink disabled:opacity-40 disabled:hover:text-muted cursor-pointer"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center cursor-pointer transition-all ${
                      validCurrentPage === pageNum
                        ? 'bg-magenta text-white shadow-sm'
                        : 'border border-line bg-white text-ink hover:bg-page'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  disabled={validCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-xl border border-line bg-page text-muted flex items-center justify-center hover:text-ink disabled:opacity-40 disabled:hover:text-muted cursor-pointer"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom 3 Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-line shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1">
                PUBLISHED SHOWCASE
              </div>
              <div className="font-display font-extrabold text-3xl text-ink">
                {projects.length} Items
              </div>
              <div className="text-[11px] text-magenta font-bold mt-1">
                88.8% Live Completion
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pink50 text-magenta flex items-center justify-center shadow-sm">
              <Rocket size={22} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-line shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1">
                TOTAL STUDIO IMPRESSIONS
              </div>
              <div className="font-display font-extrabold text-3xl text-ink">
                142.8K
              </div>
              <div className="text-[11px] text-brandOrange font-bold mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                +26.4% MoM Audience
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pink100 text-magenta flex items-center justify-center shadow-sm">
              <TrendingUp size={22} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-line shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-1">
                DIRECT INQUIRIES
              </div>
              <div className="font-display font-extrabold text-3xl text-ink">
                19 Briefs
              </div>
              <div className="text-[11px] text-muted font-bold mt-1">
                4 Pending Review
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brandOrange flex items-center justify-center shadow-sm">
              <MailCheck size={22} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectsList;

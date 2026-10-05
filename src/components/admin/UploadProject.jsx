import React, { useState } from 'react';
import { 
  ArrowLeft, UploadCloud, Sparkles, 
  AlertCircle, Trash2, Tag,
  Plus, ArrowUp, ArrowDown, Layers, Zap, Loader2
} from 'lucide-react';
import { convertMultipleImagesToWebP, formatBytes } from '../../utils/imageOptimizer';
import { createWork, updateWork } from '../../services/dataService';

const categoriesList = [
  "SOCIAL MEDIA POSTER",
  "PACKAGING DESIGN",
  "CATALOG PRODUCT BOOTH",
  "FEEDS INSTAGRAM",
  "LOGO DESIGN",
  "BRANDING & IDENTITY"
];

const UploadProject = ({ onBack, onSuccess, editingProject = null }) => {
  const [title, setTitle] = useState(editingProject ? editingProject.title : '');
  const [slug, setSlug] = useState(editingProject ? editingProject.slug : '');
  const [category, setCategory] = useState(editingProject ? editingProject.category : categoriesList[0]);
  const [client, setClient] = useState(editingProject ? (editingProject.client || '') : '');
  const [year, setYear] = useState(editingProject ? (editingProject.year || '2025') : '2025');
  const [status, setStatus] = useState(editingProject ? (editingProject.status || 'Published') : 'Published');
  const [tags, setTags] = useState(
    editingProject 
      ? (Array.isArray(editingProject.tags) ? editingProject.tags.join(', ') : editingProject.tags || '')
      : ''
  );
  const [desc, setDesc] = useState(editingProject ? (editingProject.desc || '') : '');
  
  // Multi-image slides state: array of { id, file?: File, previewUrl: string, isExisting: boolean }
  const [slides, setSlides] = useState(() => {
    if (!editingProject) return [];
    const list = Array.isArray(editingProject.images) && editingProject.images.length > 0
      ? editingProject.images
      : (editingProject.image_url ? [editingProject.image_url] : []);
    return list.map((url, i) => ({
      id: `existing-${i}`,
      file: null,
      previewUrl: url,
      isExisting: true
    }));
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationNotice, setOptimizationNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate slug when title changes (only for new projects)
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!editingProject) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleAddFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsOptimizing(true);
    setOptimizationNotice('Mengonversi gambar ke format WebP (ringan & cepat)...');
    try {
      const rawFiles = Array.from(fileList);
      const convertedFiles = await convertMultipleImagesToWebP(rawFiles, {
        quality: 0.85,
        maxDimension: 2400
      });

      const newItems = convertedFiles.map((file, idx) => ({
        id: `new-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false,
        originalSize: file.originalSize,
        optimizedSize: file.optimizedSize,
        savingsPercent: file.savingsPercent,
        isWebP: file.type === 'image/webp'
      }));

      setSlides(prev => [...prev, ...newItems]);
      const totalSaved = convertedFiles.reduce((acc, f) => acc + Math.max(0, (f.originalSize || f.size) - f.size), 0);
      if (totalSaved > 0) {
        setOptimizationNotice(`⚡ Sukses dikonversi ke WebP! Ukuran hemat ${formatBytes(totalSaved)}.`);
        setTimeout(() => setOptimizationNotice(''), 4000);
      } else {
        setOptimizationNotice('⚡ Gambar siap dalam format WebP.');
        setTimeout(() => setOptimizationNotice(''), 3000);
      }
    } catch (err) {
      console.warn('WebP conversion issue, using original files:', err);
      const fallbackItems = Array.from(fileList).map((file, idx) => ({
        id: `new-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false
      }));
      setSlides(prev => [...prev, ...fallbackItems]);
      setOptimizationNotice('');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileChange = (e) => {
    handleAddFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveSlide = (idxToRemove) => {
    setSlides(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleMoveSlide = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    setSlides(prev => {
      const copy = [...prev];
      const item = copy.splice(fromIndex, 1)[0];
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul project wajib diisi!');
      return;
    }
    if (slides.length === 0) {
      setErrorMsg('Harap unggah minimal 1 gambar untuk cover / carousel project!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const existingUrls = slides.filter(s => s.isExisting).map(s => s.previewUrl);
      const newFiles = slides.filter(s => !s.isExisting && s.file).map(s => s.file);

      const workPayload = {
        title,
        slug,
        category,
        client,
        year,
        status,
        tags,
        desc,
        existing_images: existingUrls
      };

      let savedProject;
      if (editingProject) {
        savedProject = await updateWork(editingProject.id, workPayload, newFiles, existingUrls);
      } else {
        savedProject = await createWork(workPayload, newFiles);
      }

      if (savedProject) {
        onSuccess(savedProject, !!editingProject);
      } else {
        setErrorMsg('Gagal menyimpan project.');
      }
    } catch (err) {
      console.error('Upload project error:', err);
      setErrorMsg(err.message || 'Gagal menyimpan project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-page min-h-screen">
      {/* Top Header Navigation */}
      <header className="h-20 bg-white border-b border-line px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-line bg-page text-xs font-bold text-ink hover:text-magenta hover:border-magenta transition-all"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke List Projects</span>
          </button>
          <div className="h-5 w-px bg-line"></div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider">
            STUDIO CMS / <span className="text-ink">{editingProject ? 'EDIT PROJECT' : 'UPLOAD NEW PROJECT'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-pink50 text-magenta border border-pink100">
            {editingProject ? 'EDITING MODE' : 'AUTO DRAFT SAVED'}
          </span>
        </div>
      </header>

      {/* Main Upload Form Area */}
      <main className="p-8 max-w-5xl w-full mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted mb-2">
            <Sparkles size={14} className="text-magenta" />
            <span>CREATIVE STUDIO ARTIFACT UPLOADER</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-none text-ink">
            {editingProject ? 'EDIT' : 'UPLOAD NEW'} <span className="text-magenta">PROJECT</span>
          </h1>
          <p className="text-muted text-sm font-medium mt-3">
            {editingProject
              ? 'Perbarui detail, gambar cover, tag, atau deskripsi karya yang sudah ada.'
              : 'Tambahkan karya visual, poster, packaging, atau feed Instagram terbaru kamu ke portofolio utama.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Media Uploader & Slide Carousel Manager (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-line shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink flex items-center gap-2">
                    <Layers size={14} className="text-magenta" />
                    CAROUSEL SLIDES / GAMBAR ({slides.length})
                  </label>
                  {slides.length > 0 && (
                    <label className="cursor-pointer text-xs font-bold text-magenta hover:underline flex items-center gap-1">
                      <Plus size={14} />
                      <span>Tambah Gambar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {/* WebP Optimization Status Notification */}
                {optimizationNotice && (
                  <div className="p-3 rounded-2xl bg-pink50 border border-pink100 text-magenta text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <Zap size={14} className="text-magenta shrink-0 animate-bounce" />
                    <span>{optimizationNotice}</span>
                  </div>
                )}

                {/* Slides List Display */}
                {slides.length > 0 ? (
                  <div className="space-y-3">
                    {/* Main cover preview */}
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-magenta/40 bg-page relative group shadow-sm">
                      <img 
                        src={slides[0].previewUrl} 
                        alt="Cover Slide" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 left-3 bg-magenta text-white font-extrabold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                        ★ Cover (Slide 1)
                      </div>
                      
                      {/* WebP indicator badge on Cover */}
                      {slides[0].isWebP && (
                        <div className="absolute top-3 right-3 bg-ink/80 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow border border-white/10">
                          <Zap size={10} className="text-magenta" />
                          <span>WebP Auto-Optimized</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(0)}
                          className="p-2.5 rounded-full bg-white text-red-600 shadow-md hover:scale-110 transition-transform"
                          title="Hapus Cover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Secondary slides thumbnail strip */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold text-muted uppercase tracking-wider">
                        Semua Slide ({slides.length} gambar):
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {slides.map((s, idx) => (
                          <div 
                            key={s.id} 
                            className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                              idx === 0 
                                ? 'bg-pink50/50 border-magenta/30' 
                                : 'bg-page border-line hover:border-magenta/30'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-line shrink-0">
                              <img src={s.previewUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-ink truncate flex items-center gap-1.5">
                                <span>Slide {idx + 1}</span>
                                {idx === 0 && (
                                  <span className="text-[9px] bg-magenta text-white font-extrabold px-1.5 py-0.5 rounded">
                                    COVER
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {s.isWebP && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-magenta bg-pink50 px-1.5 py-0.5 rounded border border-pink100">
                                    <Zap size={9} />
                                    <span>WebP</span>
                                  </span>
                                )}
                                {s.optimizedSize ? (
                                  <span className="text-[10px] text-muted font-mono font-medium">
                                    {formatBytes(s.optimizedSize)}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-muted">
                                    {s.isExisting ? 'Tersimpan di server' : 'File siap diunggah'}
                                  </span>
                                )}
                                {s.savingsPercent > 0 && (
                                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                                    -{s.savingsPercent}%
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Reorder and Delete controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveSlide(idx, idx - 1)}
                                  className="p-1.5 rounded-lg border border-line bg-white hover:text-magenta transition-colors"
                                  title="Geser ke atas"
                                >
                                  <ArrowUp size={13} />
                                </button>
                              )}
                              {idx < slides.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveSlide(idx, idx + 1)}
                                  className="p-1.5 rounded-lg border border-line bg-white hover:text-magenta transition-colors"
                                  title="Geser ke bawah"
                                >
                                  <ArrowDown size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveSlide(idx)}
                                className="p-1.5 rounded-lg border border-line bg-white text-red-500 hover:bg-red-50 transition-colors ml-1"
                                title="Hapus slide ini"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add more files button */}
                    <div className="pt-2">
                      <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-magenta text-magenta hover:bg-pink50 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                        <Plus size={14} />
                        <span>+ Tambah Gambar Slide Lainnya</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-line rounded-2xl p-8 text-center bg-page/40 hover:bg-page hover:border-magenta/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px]"
                  >
                    {isOptimizing ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <Loader2 size={32} className="text-magenta animate-spin mb-3" />
                        <div className="font-bold text-sm text-ink mb-1">
                          Mengonversi ke WebP...
                        </div>
                        <div className="text-muted text-xs">
                          Mengoptimalkan gambar agar website tetap super cepat &amp; ringan
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-pink50 text-magenta flex items-center justify-center mb-4 shadow-sm">
                          <UploadCloud size={28} />
                        </div>
                        <div className="font-bold text-sm text-ink mb-1">
                          Drag &amp; drop gambar (bisa pilih banyak)
                        </div>
                        <div className="text-muted text-xs mb-4">
                          Semua format (PNG, JPG, JPEG) akan otomatis dikonversi ke WebP ringan
                        </div>
                        <label className="px-5 py-2.5 rounded-xl bg-white border border-line text-xs font-bold text-ink hover:text-magenta hover:border-magenta cursor-pointer shadow-sm transition-all flex items-center gap-2">
                          <Plus size={14} />
                          <span>Pilih Gambar / Slide</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                        </label>
                      </>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-muted flex items-start gap-2 pt-2 bg-page/50 p-3 rounded-2xl border border-line">
                  <Zap size={14} className="text-magenta shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    <strong>Auto-WebP Converter:</strong> Gambar JPG/PNG yang diupload otomatis diubah ke WebP dengan kompresi berkualitas tinggi agar website tetap super cepat dan hemat ruang server.
                  </span>
                </div>
              </div>

              {/* Status and Visibility */}
              <div className="bg-white p-6 rounded-3xl border border-line shadow-sm space-y-4">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink">
                  STATUS PUBLIKASI
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('Published')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                      status === 'Published'
                        ? 'bg-magenta text-white border-magenta shadow-md shadow-magenta/25'
                        : 'bg-page text-muted border-line hover:border-magenta/30'
                    }`}
                  >
                    ✦ Published (Live)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Draft')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                      status === 'Draft'
                        ? 'bg-ink text-white border-ink shadow-md'
                        : 'bg-page text-muted border-line hover:border-ink/30'
                    }`}
                  >
                    Draft Only
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Project Metadata Details (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-line shadow-sm space-y-6">
              {/* Project Title */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                  PROJECT TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kira VTuber Stage Debut Identity"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-page border border-line rounded-2xl px-4 py-3.5 text-sm font-semibold text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                  SLUG (URL PATH)
                </label>
                <div className="flex items-center bg-page border border-line rounded-2xl px-4 py-3 text-xs font-mono text-muted focus-within:border-magenta focus-within:bg-white transition-all">
                  <span className="text-magenta font-bold">mqst.design/works/</span>
                  <input
                    type="text"
                    placeholder="kira-vtuber-stage"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent text-ink font-semibold focus:outline-none pl-1"
                  />
                </div>
              </div>

              {/* Category & Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                    CATEGORY *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-page border border-line rounded-2xl px-4 py-3.5 text-xs font-bold text-ink focus:outline-none focus:border-magenta cursor-pointer"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                    CLIENT / BRAND
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hololive IND / Urban Motion"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full bg-page border border-line rounded-2xl px-4 py-3.5 text-xs font-semibold text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Year & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                    YEAR / TIMELINE
                  </label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-page border border-line rounded-2xl px-4 py-3.5 text-xs font-semibold text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2 flex items-center justify-between">
                    <span>TAGS (PISAH DENGAN KOMA)</span>
                    <Tag size={12} className="text-magenta" />
                  </label>
                  <input
                    type="text"
                    placeholder="Vector Logo, Stream Overlays, 3D"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-page border border-line rounded-2xl px-4 py-3.5 text-xs font-semibold text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                  PROJECT DESCRIPTION
                </label>
                <textarea
                  rows="4"
                  placeholder="Tuliskan gambaran konsep, tantangan desain, dan impact visual yang dihasilkan dari project ini..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-page border border-line rounded-2xl p-4 text-xs font-medium text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-line flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3.5 rounded-2xl border border-line bg-page text-xs font-bold text-muted hover:text-ink hover:bg-white transition-all"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isOptimizing}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-magenta via-pink to-brandOrange text-white text-xs font-extrabold uppercase tracking-wider hover:opacity-95 shadow-lg shadow-magenta/30 hover:shadow-magenta/50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>MENGONVERSI WEBP...</span>
                    </>
                  ) : isSubmitting ? (
                    <span>MENYIMPAN KE MYSQL...</span>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      <span>{editingProject ? 'SIMPAN PERUBAHAN ✦' : 'PUBLISH PROJECT ✦'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UploadProject;

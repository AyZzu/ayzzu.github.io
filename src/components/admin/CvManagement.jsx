import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, UploadCloud, CheckCircle2, Trash2, ExternalLink, 
  Download, Eye, AlertCircle, RefreshCw, FileCheck, Sparkles 
} from 'lucide-react';
import CvModal from '../sections/CvModal';
import { fetchCv, uploadCv, deleteCv } from '../../services/dataService';

const CvManagement = () => {
  const [cvData, setCvData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Fetch current CV
  const loadCv = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCv();
      if (data && data.cv_url) {
        setCvData(data);
      } else {
        setCvData(null);
      }
    } catch (err) {
      console.warn('Error fetching CV:', err);
      setCvData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCv();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Ukuran file melebihi 20MB. Harap gunakan file yang lebih kecil.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const result = await uploadCv(file);
      setCvData(result);
      setStatusMessage({ type: 'success', text: `CV "${file.name}" berhasil diunggah & siap diunduh pengunjung!` });
    } catch (err) {
      console.error('Upload CV error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Gagal mengunggah CV.' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleDeleteCv = async () => {
    if (!window.confirm('Yakin ingin menghapus CV ini dari portfolio?')) return;

    try {
      await deleteCv();
      setCvData(null);
      setStatusMessage({ type: 'info', text: 'File CV berhasil dihapus dari sistem.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menghapus CV.' });
    }
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-page min-h-screen">
      {/* Header */}
      <header className="h-20 bg-white border-b border-line px-8 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
            STUDIO CMS ASSETS
          </div>
          <div className="font-display font-black text-xl text-ink">
            CURRICULUM VITAE (CV)
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCv}
            title="Refresh status"
            className="p-2.5 rounded-xl border border-line bg-page text-muted hover:text-magenta transition-all"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-5xl w-full mx-auto space-y-8">
        {/* Status notification */}
        {statusMessage.text && (
          <div 
            className={`p-4 rounded-2xl flex items-center gap-3 border text-sm font-medium ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Overview Banner */}
        <div className="bg-white rounded-3xl border border-line p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink50 text-magenta text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles size={12} /> PUBLIC PORTFOLIO ASSET
            </div>
            <h2 className="font-display font-extrabold text-2xl text-ink">
              Kelola File CV / Resume
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              File yang kamu unggah di sini akan langsung tertaut ke tombol <strong>"LIHAT CV"</strong> di bagian Hero website utama. Pengunjung dan calon klien dapat langsung membuka dan mengunduh berkas ini.
            </p>
          </div>

          <div className="bg-page p-4 rounded-2xl border border-line/60 flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-magenta text-white flex items-center justify-center font-bold">
              <FileCheck size={24} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase text-muted tracking-wider">STATUS DI WEB</div>
              <div className="font-bold text-sm text-ink flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${cvData ? 'bg-success' : 'bg-amber-400'}`}></span>
                {cvData ? 'Aktif & Tersedia' : 'Belum Ada CV'}
              </div>
            </div>
          </div>
        </div>

        {/* Current Active CV Card */}
        {cvData && (
          <div className="bg-white rounded-3xl border border-line p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-pink50 text-magenta flex items-center justify-center border border-pink100 shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-ink">
                      {cvData.original_name || cvData.filename || 'Curriculum_Vitae_MQST.pdf'}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Ukuran: {formatFileSize(cvData.size)} • Diperbarui:{' '}
                    {cvData.updated_at ? new Date(cvData.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-magenta text-white hover:bg-pink text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-magenta/25 cursor-pointer"
                >
                  <Eye size={15} />
                  <span>Lihat Preview Pop-up</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = cvData.cv_url;
                    a.download = cvData.original_name || 'CV-Muhammad-Muqsit-Faiz.pdf';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-page border border-line text-ink hover:text-magenta hover:border-magenta/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Unduh</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCv}
                  className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={15} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            {/* Quick Preview Box if PDF or Image */}
            <div className="bg-page/50 rounded-2xl p-4 border border-line/50 flex items-center justify-between">
              <span className="text-xs text-muted font-medium">
                URL Publik CV: <code className="bg-white px-2 py-1 rounded border border-line text-magenta font-mono text-[11px] select-all break-all">{cvData.cv_url?.slice(0, 70)}...</code>
              </span>
              <a
                href={cvData.cv_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-magenta hover:underline flex items-center gap-1 shrink-0 ml-4"
              >
                <span>Uji Buka Tab Baru</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}

        {/* Upload Zone */}
        <div className="bg-white rounded-3xl border border-line p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-xl text-ink">
                {cvData ? 'Unggah Versi CV Baru (Timpa)' : 'Unggah File CV Kamu'}
              </h3>
              <p className="text-xs text-muted font-medium mt-1">
                Format yang didukung: <strong>PDF, DOC, DOCX, PNG, JPG</strong> (Maksimal 20 MB).
              </p>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-magenta bg-pink50/50 scale-[0.99]' 
                : 'border-line hover:border-magenta/50 hover:bg-page/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-pink50 text-magenta flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud size={32} />
            </div>

            {isUploading ? (
              <div className="space-y-2">
                <div className="font-bold text-ink text-sm flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-magenta" />
                  Mengunggah berkas CV...
                </div>
                <p className="text-xs text-muted">Mohon tunggu sebentar.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-bold text-ink text-base">
                  Klik untuk pilih file atau tarik & letakkan ke sini
                </div>
                <p className="text-xs text-muted">
                  Disarankan menggunakan format <strong>PDF</strong> untuk tata letak CV yang rapi dan profesional.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Preview Pop-up */}
        <CvModal 
          cvData={cvData} 
          isOpen={showPreviewModal} 
          onClose={() => setShowPreviewModal(false)} 
        />
      </main>
    </div>
  );
};

export default CvManagement;

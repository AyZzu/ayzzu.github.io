import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, RefreshCw, AlertCircle } from 'lucide-react';

const CvModal = ({ cvData, isOpen, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle data URLs converting to Blobs for stable browser iframe rendering
  useEffect(() => {
    if (!cvData?.cv_url) {
      setBlobUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    const rawUrl = cvData.cv_url;

    // If it's a data URL (e.g. data:application/pdf;base64,...)
    if (rawUrl.startsWith('data:')) {
      try {
        const arr = rawUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setIsLoading(false);

        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      } catch (err) {
        console.warn('Failed to parse data URL into blob:', err);
        setBlobUrl(rawUrl);
        setIsLoading(false);
      }
    } else {
      // Normal HTTP url
      setBlobUrl(rawUrl);
      setIsLoading(false);
    }
  }, [cvData]);

  // Determine file type
  const isImage = useMemo(() => {
    if (!cvData) return false;
    const url = (cvData.cv_url || '').toLowerCase();
    const name = (cvData.original_name || cvData.filename || '').toLowerCase();
    const mime = (cvData.mimetype || '').toLowerCase();
    return mime.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg)$/.test(name) || url.startsWith('data:image/');
  }, [cvData]);

  const isWordDoc = useMemo(() => {
    if (!cvData) return false;
    const name = (cvData.original_name || cvData.filename || '').toLowerCase();
    return /\.(docx|doc)$/.test(name);
  }, [cvData]);

  // Direct download trigger
  const handleDownload = () => {
    if (!blobUrl && !cvData?.cv_url) return;
    const downloadUrl = blobUrl || cvData.cv_url;
    const fileName = cvData?.original_name || cvData?.filename || 'CV-Muhammad-Muqsit-Faiz.pdf';

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5 lg:p-8 select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-5xl h-[94vh] sm:h-[90vh] bg-white rounded-2xl sm:rounded-3xl border border-line shadow-2xl shadow-magenta/25 overflow-hidden flex flex-col my-auto"
        >
          {/* Top Bar */}
          <div className="px-3 sm:px-6 py-2.5 sm:py-4 border-b border-line flex items-center justify-between bg-white/95 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden pr-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-pink50 text-magenta flex items-center justify-center shrink-0 border border-pink100">
                <FileText size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="font-display font-extrabold text-sm sm:text-base md:text-lg text-ink truncate leading-tight">
                    CV Preview
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-pink100 text-magenta shrink-0">
                    {isImage ? 'IMAGE' : isWordDoc ? 'DOCX' : 'PDF'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted truncate mt-0.5 font-medium">
                  {cvData?.original_name || cvData?.filename || 'CV-Muhammad-Muqsit-Faiz.pdf'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleDownload}
                className="bg-magenta text-white hover:bg-pink px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shadow-magenta/25 cursor-pointer"
                title="Unduh file CV"
              >
                <Download size={13} />
                <span>Unduh</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-page border border-line text-ink hover:text-magenta hover:border-magenta hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Tutup Preview (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Preview Area */}
          <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw size={28} className="animate-spin text-magenta" />
                <span className="text-xs font-bold text-ink uppercase tracking-wider">Memuat Pratinjau CV...</span>
              </div>
            )}

            {isImage ? (
              /* Image Preview */
              <div className="w-full h-full overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[#2A2B32]/10">
                <img
                  src={blobUrl || cvData?.cv_url}
                  alt="CV Preview"
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-xl bg-white border border-line"
                />
              </div>
            ) : isWordDoc ? (
              /* Word Doc Fallback */
              <div className="bg-white rounded-3xl p-10 max-w-md border border-line text-center shadow-lg space-y-4 m-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText size={36} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-ink">Dokumen Word (.docx)</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Dokumen Word tidak dapat dipratinjau langsung di dalam browser. Silakan unduh berkas untuk membukanya di Microsoft Word atau Google Docs.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-magenta text-white font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-pink transition-all flex items-center justify-center gap-2 shadow-md shadow-magenta/25"
                >
                  <Download size={16} /> Unduh Berkas Word
                </button>
              </div>
            ) : (
              /* PDF Preview using native iframe */
              <iframe
                src={`${blobUrl || cvData?.cv_url}#toolbar=1&navpanes=0&view=FitH`}
                title="CV Document Preview"
                className="w-full h-full border-0 bg-white"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setLoadError(true);
                }}
              />
            )}

            {loadError && (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertCircle size={26} />
                </div>
                <h4 className="font-bold text-ink">Pratinjau Tidak Dapat Ditampilkan</h4>
                <p className="text-xs text-muted max-w-sm">
                  Browser kamu membatasi tampilan pratinjau inline ini. Namun kamu tetap bisa langsung mengunduh berkasnya.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2.5 bg-magenta text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-pink transition-all flex items-center gap-2"
                >
                  <Download size={14} /> Unduh Berkas CV
                </button>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 border-t border-line bg-white flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs text-muted font-medium">
            <div>
              💡 Kamu dapat memperbesar (zoom), menggulir halaman, dan mencetak langsung dari kontrol pratinjau di atas.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-magenta font-bold hover:underline"
              >
                Tutup Pop-up
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CvModal;

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, X, RefreshCw, Key, Globe, ShieldCheck } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testSupabaseConnection } from '../../utils/supabaseClient';

const SupabaseSettingsModal = ({ isOpen, onClose, onConfigSaved }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Mohon isi Supabase URL dan Anon Key terlebih dahulu.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    setSaveSuccess(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    if (window.confirm('Reset kredensial Supabase ke nilai default file .env?')) {
      clearSupabaseConfig();
      const config = getSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setTestResult({ success: true, message: 'Kredensial direset ke default file .env' });
      if (onConfigSaved) onConfigSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-line shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-xl text-ink">Supabase Cloud Database</h3>
            <p className="text-xs text-muted">Koneksi database langsung untuk GitHub Pages</p>
          </div>
        </div>

        <div className="bg-page/60 border border-line rounded-2xl p-4 mb-6 text-xs text-muted leading-relaxed">
          <p className="font-semibold text-ink mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-magenta" />
            Bisa Langsung Diisi di Browser:
          </p>
          Data kredensial Supabase ini disimpan aman di browser Anda via <code className="bg-white px-1.5 py-0.5 rounded border border-line font-mono text-[11px]">localStorage</code>. Website Anda di GitHub Pages akan langsung terhubung ke database Supabase secara real-time tanpa perlu backend server!
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Supabase Project URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-muted pointer-events-none" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-white border border-line rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink focus:outline-none focus:border-magenta transition-colors"
              />
            </div>
            <p className="text-[11px] text-muted mt-1">Dapatkan di: Dashboard Supabase &gt; Project Settings &gt; API &gt; Project URL</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Supabase Anon Public Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-muted pointer-events-none" />
              <textarea
                rows={2}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-white border border-line rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink font-mono focus:outline-none focus:border-magenta transition-colors resize-none"
              />
            </div>
            <p className="text-[11px] text-muted mt-1">Dapatkan di: Dashboard Supabase &gt; Project Settings &gt; API &gt; anon public key</p>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs mb-6 flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : testResult.tableMissing
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            )}
            <div>
              <p className="font-semibold">{testResult.success ? 'Koneksi Berhasil!' : 'Perhatian Koneksi'}</p>
              <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs mb-6 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Konfigurasi Supabase berhasil disimpan! Memuat ulang data...</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-line">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-muted hover:text-ink font-medium transition-colors order-3 sm:order-1"
          >
            Reset ke Default
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl border border-line text-xs font-bold text-ink hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Menguji...
                </>
              ) : (
                'Test Koneksi'
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-magenta text-white text-xs font-bold hover:bg-magenta/90 shadow-md shadow-magenta/25 transition-all"
            >
              Simpan &amp; Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSettingsModal;

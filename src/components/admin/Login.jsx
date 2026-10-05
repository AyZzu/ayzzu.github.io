import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import logoIcon from '../../assets/logo-magenta.webp';
import { authLogin } from '../../services/dataService';

// Google reCAPTCHA v2 official public demo / test sitekey (always succeeds on localhost)
const GOOGLE_RECAPTCHA_SITEKEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

const Login = ({ onLoginSuccess, onBackToPortfolio, dbStatus }) => {
  const [email, setEmail] = useState('muqsit@mqst.design');
  const [password, setPassword] = useState('mqst2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    // Expose callback globally for Google reCAPTCHA
    window.onRecaptchaSuccess = (token) => {
      setRecaptchaToken(token);
      setErrorMsg('');
    };

    window.onRecaptchaExpired = () => {
      setRecaptchaToken(null);
    };

    const initRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
        try {
          if (widgetIdRef.current === null) {
            widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
              sitekey: GOOGLE_RECAPTCHA_SITEKEY,
              callback: 'onRecaptchaSuccess',
              'expired-callback': 'onRecaptchaExpired'
            });
          }
        } catch {
          // already rendered
        }
      }
    };

    const timer = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.render) {
        initRecaptcha();
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      setErrorMsg('Silakan centang verifikasi "I\'m not a robot" dari Google terlebih dahulu!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await authLogin(email, password);
      if (result.success && result.user) {
        localStorage.setItem('mqst_cms_token', result.token);
        localStorage.setItem('mqst_cms_user', JSON.stringify(result.user));
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message || 'Email atau password salah');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Gagal login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-page font-sans selection:bg-magenta selection:text-white relative">
      {/* Background Subtle Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink50 rounded-full blur-[140px] pointer-events-none opacity-60"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-lilac rounded-full blur-[140px] pointer-events-none opacity-40"></div>

      {/* Grid Pattern Behind Container */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage: `linear-gradient(#ECE6EE 1px, transparent 1px), linear-gradient(90deg, #ECE6EE 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      ></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-line shadow-2xl shadow-magenta/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Side: Welcome Brand Banner */}
        <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-pink50/60 via-white/40 to-pink100/40 border-b lg:border-b-0 lg:border-r border-line">
          {/* Decorative fluid ribbon */}
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-gradient-to-tr from-brandOrange via-magenta to-lilac rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          <div className="my-auto flex flex-col items-start py-8">
            {/* Top Brand Header */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-white border border-line flex items-center justify-center p-2 shadow-sm">
                <img src={logoIcon} alt="MQST" className="w-full h-auto object-contain" />
              </div>
              <span className="font-display font-black text-2xl tracking-wider text-ink">MQST</span>
            </div>

            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-pink100 text-magenta px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider mb-8">
              <Sparkles size={12} /> INTERNAL PRODUCTION SUITE
            </div>

            {/* Logo Brand Showcase in place of Welcome Back */}
            <div className="w-full mb-8">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/80 border border-line p-4 shadow-xl shadow-magenta/10 flex items-center justify-center mb-6">
                <img 
                  src={logoIcon} 
                  alt="MQST Studio" 
                  className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(240,48,154,0.3)] hover:scale-105 transition-transform" 
                />
              </div>
              <div className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-none text-ink">
                MQST <span className="text-magenta">STUDIO</span>
              </div>
            </div>

            <p className="text-muted text-sm leading-relaxed font-medium max-w-sm">
              Manage portfolio projects, case studies, and incoming client briefs for{' '}
              <strong className="text-ink font-bold">Muhammad Muqsit Faiz M.</strong>
            </p>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-14 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {/* Header info */}
            <div className="flex items-center gap-2 text-magenta text-xs font-bold uppercase tracking-widest mb-3">
              <Lock size={14} /> SECURE ACCESS
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter leading-none mb-3 text-ink">
              SIGN IN <span className="text-magenta">TO CMS</span>
            </h2>
            <p className="text-muted text-sm font-medium mb-8">
              Enter your admin credentials to access the studio management console.
            </p>

            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                  ADMIN EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="muqsit@mqst.design"
                    className="w-full bg-page/70 border border-line rounded-2xl px-4 py-3.5 text-sm font-medium text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-ink mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-page/70 border border-line rounded-2xl px-4 py-3.5 pr-11 text-sm font-medium text-ink focus:outline-none focus:border-magenta focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Official Google reCAPTCHA v2 Widget Container */}
              <div className="flex justify-center my-2 select-none overflow-hidden rounded-md">
                <div ref={recaptchaRef} className="min-h-[78px] flex items-center justify-center"></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-muted font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-line text-magenta focus:ring-magenta w-4 h-4 accent-magenta"
                  />
                  <span>Remember me (30 days)</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password default adalah: mqst2025'); }} className="text-magenta font-bold hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-4 px-6 rounded-2xl font-display font-extrabold text-white text-sm tracking-wider uppercase bg-gradient-to-r from-magenta via-pink to-brandOrange hover:opacity-95 shadow-lg shadow-magenta/30 hover:shadow-magenta/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>SIGN IN TO DASHBOARD</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-line text-center flex items-center justify-between text-[11px] text-muted font-medium">
              <button 
                onClick={onBackToPortfolio}
                className="hover:text-magenta transition-colors flex items-center gap-1 font-bold"
              >
                ← Back to Portfolio
              </button>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-success" />
                <span>Protected by MQST Studio Security</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

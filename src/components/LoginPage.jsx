import React, { useState } from 'react';
import { Lock, Mail, Key, AlertTriangle, ArrowRight, UserPlus, ArrowLeft, Info } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { translations } from '../utils/translations';
import heroForest from '../assets/hero-forest.jpg';

export default function LoginPage({ onLogin, onBack, lang }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const t = translations[lang || 'es'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (authError) throw authError;

        if (data.user) {
          onLogin(data.user);
          setEmail('');
          setPassword('');
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password
        });

        if (authError) throw authError;

        setSuccessMsg(
          lang === 'en' 
            ? "Sign up successful! Please check your email inbox to confirm your address before logging in." 
            : "¡Registro de cuenta completado! Revisa la bandeja de entrada de tu correo para confirmar la dirección antes de iniciar sesión."
        );
        setMode('signin');
        setPassword('');
      }
    } catch (err) {
      console.error('Auth Error:', err);
      let errMsg = err.message || t.loginError;
      
      // Customize email confirmation error message for better clarity
      if (errMsg.toLowerCase().includes('confirm') || errMsg.toLowerCase().includes('not confirmed')) {
        errMsg = lang === 'en'
          ? "Email address not confirmed. Please check your inbox (or spam folder) for the verification link, or disable 'Confirm email' in the Supabase Dashboard."
          : "Correo no confirmado. Por favor revisa tu bandeja de entrada o spam para verificar tu cuenta, o desactiva la opción 'Confirm email' en tu panel de Supabase.";
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAF5] font-sans antialiased text-[#2D3436]">
      
      {/* Back Button Overlay */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-30 bg-white/95 backdrop-blur-sm border border-[#EEF5E9] hover:bg-[#EEF5E9] text-brand-darkgreen hover:text-black py-2.5 px-4 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t.btnBack || (lang === 'en' ? 'Back' : 'Volver')}</span>
      </button>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* Left Side: Premium Imagery and Typography (Hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-6 relative items-end p-16 overflow-hidden bg-brand-darkgreen">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroForest} 
              alt="Bosque Seco Tropical" 
              className="w-full h-full object-cover object-center opacity-40 scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-darkgreen via-brand-darkgreen/40 to-transparent"></div>
          </div>

          <div className="relative z-10 text-left max-w-lg text-white">
            <span className="text-xs tracking-[0.25em] text-brand-sage font-bold font-mono uppercase block mb-4">
              {lang === 'en' ? 'BST ACTIVE PROTECTION' : 'PROTECCIÓN ACTIVA B.S.T.'}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif-editorial text-brand-cream leading-tight mb-6">
              {lang === 'en' ? 'Guardians of the forest.' : 'Guardianes del territorio.'}
            </h2>
            <p className="text-sm text-brand-cream/80 leading-relaxed font-light font-sans mb-8">
              {lang === 'en' 
                ? 'Join our network of community active sensors and forest fire response teams in Valle del Cauca.'
                : 'Únete a nuestra red de sensores comunitarios activos y brigadas de prevención del bosque seco tropical.'}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono tracking-wider text-brand-sage uppercase font-bold">
              <span>TEAM COLOMBIA</span>
              <span>•</span>
              <span>FGC 2026</span>
            </div>
          </div>
        </div>

        {/* Right Side: Log In / Sign Up Form */}
        <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-8 bg-white relative">
          
          <div className="w-full max-w-md flex flex-col gap-6">
            
            {/* Logo details */}
            <div className="flex flex-col text-left mb-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#EEF5E9] text-[#2D6A4F] p-3 rounded-2xl">
                  {mode === 'signin' ? <Lock className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#2D3436] font-serif-editorial">
                    {mode === 'signin' ? (lang === 'en' ? "Access Gateway" : "Portal de Acceso") : (lang === 'en' ? "Join the Community" : "Unirse a la Comunidad")}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                    {mode === 'signin' ? (lang === 'en' ? "PORTAL INGRESO" : "INGRESAR AL SISTEMA") : (lang === 'en' ? "CREATE NEW ACCOUNT" : "CREAR NUEVA CUENTA")}
                  </span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex flex-col gap-2 text-left">
                <div className="flex gap-2 items-center">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="font-semibold">{error}</span>
                </div>
                {error.includes('confirm') && (
                  <div className="mt-2 bg-white/60 border border-red-200/50 p-2.5 rounded-xl text-[10px] text-red-600 leading-normal flex gap-1.5 items-start">
                    <Info className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? "Tip: Check your email inbox. If you are the administrator, you can turn off 'Confirm email' under Authentication -> Providers -> Email in your Supabase dashboard to allow instant logins."
                        : "Consejo: Verifica tu bandeja de entrada. Si eres administrador, puedes desactivar la opción 'Confirm email' en Authentication -> Providers -> Email dentro de tu panel de Supabase para permitir accesos instantáneos."}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Success message */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex gap-2 items-start text-left leading-normal">
                <Lock className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">{lang === 'en' ? 'Registration Successful' : 'Registro Completo'}</span>
                  <span>{successMsg}</span>
                </div>
              </div>
            )}

            {/* Access Banner */}
            <div className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] p-4 rounded-2xl leading-relaxed text-left">
              <span className="font-bold">{lang === 'en' ? 'Community Access:' : 'Acceso de la Comunidad:'}</span>{' '}
              {lang === 'en' 
                ? 'Anyone can sign up freely to join the community and collaborate. Brigade and official coordinator accounts are managed internally.'
                : 'Cualquier ciudadano puede registrarse libremente para ingresar a la comunidad y colaborar. Las cuentas oficiales de brigadistas y coordinadores se gestionan de forma interna.'}
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  {t.loginPIN}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.loginPINPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAF5] border border-[#EEF5E9] rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  {lang === 'en' ? 'Password' : 'Contraseña'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAF5] border border-[#EEF5E9] rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
                  />
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D6A4F] hover:bg-[#1E4635] text-white py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg mt-2 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  mode === 'signin' ? t.loginButton : (lang === 'en' ? "Register" : "Registrarse")
                )}
              </button>
            </form>

            {/* Toggle Mode Link */}
            <div className="mt-4 text-center">
              {mode === 'signin' ? (
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-xs text-[#2D6A4F] hover:text-[#1E4635] font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {lang === 'en' ? "Don't have an account? Register here" : "¿No tienes cuenta? Regístrate aquí"}
                  <ArrowRight className="h-3 w-3" />
                </button>
              ) : (
                <button
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="text-xs text-[#2D6A4F] hover:text-[#1E4635] font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {lang === 'en' ? "Already have an account? Log in" : "¿Ya tienes cuenta? Inicia sesión"}
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

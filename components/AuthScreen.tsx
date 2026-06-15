'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Mail, Lock, User, ShieldCheck, ArrowRight, 
  HelpCircle, CheckCircle, AlertCircle, RefreshCw, Car, Bike, Info
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function AuthScreen() {
  const { login, registerUser, forgotPassword, serviceCenters } = useAppStore();

  const [mode, setMode] = React.useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  
  // Registration Role
  const [role, setRole] = React.useState<'customer' | 'center_admin' | 'app_admin'>('customer');
  const [selectedCenterId, setSelectedCenterId] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (serviceCenters.length > 0) {
      setSelectedCenterId(serviceCenters[0].id);
    }
  }, [serviceCenters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          setError('Please fulfill both the email and password fields.');
          setLoading(false);
          return;
        }
        const success = await login(email, password);
        if (!success) {
          setError('Invalid login credentials. Try using one of our click-to-fill test accounts below!');
        }
      } else if (mode === 'signup') {
        if (!name || !email || !password) {
          setError('Please fulfill all registration blanks.');
          setLoading(false);
          return;
        }
        const success = await registerUser(
          name, 
          email, 
          role, 
          role === 'center_admin' ? selectedCenterId : undefined
        );
        if (!success) {
          setError('An account with this email address already is registered.');
        } else {
          setSuccessMessage('Account created successfully! Redirecting...');
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setError('Please provide your registered email address.');
          setLoading(false);
          return;
        }
        const success = await forgotPassword(email);
        if (success) {
          setSuccessMessage(`A dynamic recovery passcode has been transmitted to ${email}. Check your inbox!`);
        } else {
          setError('No user account corresponds to this email address.');
        }
      }
    } catch (err) {
      setError('An unexpected error transpired. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail: string) => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    await login(demoEmail, 'password');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="auth-wall-page">
      {/* Decorative starry / neon fluid backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-700/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Logo and Brand Heading */}
        <div className="text-center space-y-2.5">
          <div className="w-13 h-13 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center font-black text-white text-xl shadow-xl shadow-blue-500/10 mx-auto">
            WD
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-extrabold text-white text-2xl tracking-tight">WashBook</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                SaaS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Car & Bike Wash Detailing Platform</p>
          </div>
        </div>

        {/* Core Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6.5 shadow-2xl relative" id="auth-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* Card Title */}
              <div>
                <h3 className="text-lg font-black text-white">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Your Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </h3>
                <p className="text-xs text-slate-400">
                  {mode === 'signin' && 'Sign in to schedule detailing bookings or manage facilities'}
                  {mode === 'signup' && 'Register now to book wash slots or list your detailing center'}
                  {mode === 'forgot' && 'Provide your registered email to request a passcode recovery'}
                </p>
              </div>

              {/* Status Notifications */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2.5 items-start text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2.5 items-start text-xs text-emerald-300 animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Krishna Raj"
                        required
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 rounded-xl p-3.5 pl-10 focus:outline-hidden focus:border-blue-500 transition-colors"
                      />
                      <User className="absolute left-3 top-4 w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 rounded-xl p-3.5 pl-10 focus:outline-hidden focus:border-blue-500 transition-colors"
                    />
                    <Mail className="absolute left-3 top-4 w-4 h-4 text-slate-600" />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Password</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[10px] text-blue-400 font-bold hover:underline"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 rounded-xl p-3.5 pl-10 focus:outline-hidden focus:border-blue-500 transition-colors"
                      />
                      <Lock className="absolute left-3 top-4 w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                )}

                {/* SIGN UP ROLE PICKER */}
                {mode === 'signup' && (
                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Select Account Type</label>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all border ${
                          role === 'customer'
                            ? 'bg-blue-600/10 border-blue-600 text-blue-400 font-extrabold'
                            : 'border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="text-[9px]">Customer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('center_admin')}
                        className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all border ${
                          role === 'center_admin'
                            ? 'bg-indigo-600/10 border-indigo-600 text-indigo-400 font-extrabold'
                            : 'border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span className="text-[9px]">Center Admin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('app_admin')}
                        className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all border ${
                          role === 'app_admin'
                            ? 'bg-teal-600/10 border-teal-600 text-teal-400 font-extrabold'
                            : 'border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[9px]">SaaS Admin</span>
                      </button>
                    </div>

                    {/* Facility assign selector if center admin selected */}
                    {role === 'center_admin' && (
                      <div className="space-y-1 mt-2.5 pt-2 border-t border-slate-900">
                        <label className="block text-[9px] font-extrabold text-slate-500 uppercase">Select Managed Center</label>
                        <select
                          value={selectedCenterId}
                          onChange={(e) => setSelectedCenterId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:outline-hidden"
                        >
                          {serviceCenters.map(center => (
                            <option key={center.id} value={center.id}>
                              {center.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Execution CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/15 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>
                        {mode === 'signin' && 'Sign In'}
                        {mode === 'signup' && 'Register Account'}
                        {mode === 'forgot' && 'Send Reset Passcode'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle visual mode footer */}
              <div className="text-center pt-2 text-xs">
                {mode === 'signin' ? (
                  <p className="text-slate-500 font-medium">
                    New to WashBook?{' '}
                    <button
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-blue-400 font-bold hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-500 font-medium">
                    Already registered?{' '}
                    <button
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-blue-400 font-bold hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DEMO ACCOUNTS DRAWER - EXTREMELY HELPFUL FOR INSTRUCTORS / AUDITORS */}
        <div className="bg-slate-900/50 p-4 border border-slate-800/80 rounded-3xl space-y-3.5 shadow-xl relative overflow-hidden">
          <div className="flex gap-2 items-center">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
            <h4 className="text-xs font-black text-slate-100">Click-to-Fill Demo Accounts</h4>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Quickly toggle and experience WashDash under multiple customized dashboards without registering manually. Click any button to log in:
          </p>

          <div className="space-y-2">
            {/* Customer Demo */}
            <button
              onClick={() => handleDemoSignIn('customer@washbook.com')}
              className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/60 rounded-xl flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-extrabold text-slate-200 block truncate">1. Customer Perspective</span>
                  <span className="text-[9px] text-slate-500 block truncate">customer@washbook.com</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-md group-hover:bg-blue-400 group-hover:text-white transition-all">
                Login
              </span>
            </button>

            {/* Center Admin Demo */}
            <button
              onClick={() => handleDemoSignIn('admin.elite@washbook.com')}
              className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/60 rounded-xl flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bike className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-extrabold text-slate-200 block truncate">2. Facility Center Admin</span>
                  <span className="text-[9px] text-slate-500 block truncate">admin.elite@washbook.com</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded-md group-hover:bg-indigo-400 group-hover:text-white transition-all">
                Login
              </span>
            </button>

            {/* App Admin Demo */}
            <button
              onClick={() => handleDemoSignIn('app.admin@washbook.com')}
              className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/60 rounded-xl flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-extrabold text-slate-200 block truncate">3. Platform SaaS Admin</span>
                  <span className="text-[9px] text-slate-500 block truncate">app.admin@washbook.com</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded-md group-hover:bg-teal-400 group-hover:text-white transition-all">
                Login
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import {
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'otp-email' | 'otp-sms' | 'forgot';
  onNavigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onNavigate }) => {
  const { setUser, showToast } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'otp-email' | 'otp-sms' | 'forgot'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Standard Email + Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await api.loginWithPassword(email, password);
      if (res.success && res.data) {
        localStorage.setItem('sultan_auth_token', res.data.token);
        setUser(res.data.user, (res.data as any).permissions || []);
        showToast(`Welcome back, ${res.data.user.firstName}!`, 'success');
        if (res.data.user.role !== 'CUSTOMER') {
          onNavigate('/admin');
        } else {
          onNavigate('/account');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Customer Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await api.register({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined
      });
      if (res.success && res.data) {
        localStorage.setItem('sultan_auth_token', res.data.token);
        setUser(res.data.user, []);
        showToast('Account created! Welcome to Fumare Hookah.', 'success');
        onNavigate('/account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Request Email OTP
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      const res = await api.sendEmailOtp(email);
      if (res.success) {
        setSuccessMsg(res.message || 'One-time passcode sent to your email.');
        showToast('OTP Code sent to email (Simulation Sandbox)', 'info');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send Email OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify Email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await api.verifyEmailOtp(email, otpCode);
      if (res.success && res.data) {
        localStorage.setItem('sultan_auth_token', res.data.token);
        setUser(res.data.user, []);
        showToast('Verified successfully via Email OTP!', 'success');
        onNavigate('/account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Request SMS OTP
  const handleSendSmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setLoading(true);
      const res = await api.sendSmsOtp(phone);
      if (res.success) {
        setSuccessMsg(res.message || 'One-time passcode sent to your phone.');
        showToast('SMS OTP Code sent (Simulation Sandbox)', 'info');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send SMS OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Verify SMS OTP
  const handleVerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setLoading(true);
      const res = await api.verifySmsOtp(phone, otpCode);
      if (res.success && res.data) {
        localStorage.setItem('sultan_auth_token', res.data.token);
        setUser(res.data.user, []);
        showToast('Verified successfully via SMS OTP!', 'success');
        onNavigate('/account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid SMS OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 7. Google Firebase Fast Auth
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    try {
      setLoading(true);
      const { loginWithGoogle } = useStore.getState();
      const user = await loginWithGoogle();
      if (user.role !== 'CUSTOMER') {
        onNavigate('/admin');
      } else {
        onNavigate('/account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-stone-50/50 py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        
        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-sm shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-900 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-amber-900">
              Fumare Hookah Access
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              {mode === 'login' && 'Sign In to Your Account'}
              {mode === 'register' && 'Create Fumare Account'}
              {mode === 'otp-email' && 'Passwordless Email OTP'}
              {mode === 'otp-sms' && 'SMS One-Time Code'}
              {mode === 'forgot' && 'Reset Vault Password'}
            </h1>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-stone-200 text-xs">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 font-semibold border-b-2 text-center ${mode === 'login' ? 'border-amber-900 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}
            >
              Password
            </button>
            <button
              onClick={() => { setMode('otp-email'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 font-semibold border-b-2 text-center ${mode === 'otp-email' ? 'border-amber-900 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}
            >
              Email OTP
            </button>
            <button
              onClick={() => { setMode('otp-sms'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 font-semibold border-b-2 text-center ${mode === 'otp-sms' ? 'border-amber-900 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}
            >
              SMS OTP
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 font-semibold border-b-2 text-center ${mode === 'register' ? 'border-amber-900 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}
            >
              Register
            </button>
          </div>

          {/* Status Banners */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs flex items-center gap-2 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center gap-2 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form 1: Password Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sultanhookah.com"
                    className="w-full bg-stone-50 border border-stone-300 text-xs pl-9 pr-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-amber-800 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-stone-50 border border-stone-300 text-xs pl-9 pr-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <button
                id="auth-submit-login-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Form 2: Email OTP */}
          {mode === 'otp-email' && (
            <div className="space-y-4">
              <form onSubmit={handleSendEmailOtp} className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">VIP Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vip@sultanhookah.com"
                    className="flex-1 bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-3 py-2.5 rounded-xs transition-colors"
                  >
                    Send OTP
                  </button>
                </div>
              </form>

              <form onSubmit={handleVerifyEmailOtp} className="space-y-3 pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700">6-Digit Email Code</label>
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 text-center font-mono tracking-widest text-base font-bold px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                />
                <button
                  id="verify-email-otp-btn"
                  type="submit"
                  disabled={loading || !otpCode}
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Code & Enter'}
                </button>
              </form>
            </div>
          )}

          {/* Form 3: SMS OTP */}
          {mode === 'otp-sms' && (
            <div className="space-y-4">
              <form onSubmit={handleSendSmsOtp} className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Mobile Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 785-8260"
                    className="flex-1 bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold px-3 py-2.5 rounded-xs transition-colors"
                  >
                    Send SMS
                  </button>
                </div>
              </form>

              <form onSubmit={handleVerifySmsOtp} className="space-y-3 pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700">SMS Verification Code</label>
                <input
                  type="text"
                  required
                  placeholder="Enter SMS code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 text-center font-mono tracking-widest text-base font-bold px-3 py-2.5 rounded-xs focus:outline-none focus:border-amber-800"
                />
                <button
                  id="verify-sms-otp-btn"
                  type="submit"
                  disabled={loading || !otpCode}
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify SMS & Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Form 4: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone (For SMS Delivery Updates)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2 rounded-xs focus:outline-none focus:border-amber-800"
                />
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Form 5: Forgot Password */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">Enter your registered email and we will send you password reset authorization instructions.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                await api.forgotPassword(email);
                setLoading(false);
                setSuccessMsg('Reset code generated and dispatched to your email.');
              }} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full bg-stone-50 border border-stone-300 text-xs px-3 py-2.5 rounded-xs"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 text-white text-xs font-semibold py-2.5 rounded-xs"
                >
                  Send Reset Link
                </button>
              </form>
            </div>
          )}

          {/* Google 1-Click Login Divider */}
          <div className="relative border-t border-stone-200 pt-4">
            <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-2 text-[10px] uppercase font-bold text-stone-400">
              Or Instant Connect
            </span>

            <button
              id="google-login-btn"
              type="button"
              onClick={handleGoogleAuth}
              className="w-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold py-2.5 px-4 rounded-xs transition-colors flex items-center justify-center gap-2.5 shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { api } from '../services/api.js';
import {
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Send,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onNavigate: (path: string) => void;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
];

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onNavigate }) => {
  const { setUser, showToast } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    initialMode === 'register' ? 'register' : initialMode === 'forgot' ? 'forgot' : 'login'
  );

  // Common Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // 1. LOGIN FIELDS
  // "User" & "Password"
  const [loginUser, setLoginUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // 2. NEW USER / REGISTER FIELDS
  // "First name second name"
  const [regFirstName, setRegFirstName] = useState('');
  const [regSecondName, setRegSecondName] = useState('');
  // "Email / mobile" selector
  const [regContactType, setRegContactType] = useState<'email' | 'mobile'>('email');
  const [regEmail, setRegEmail] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+1');
  const [regMobile, setRegMobile] = useState('');
  // "Request otp" & verification
  const [regOtpRequested, setRegOtpRequested] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [regOtpLoading, setRegOtpLoading] = useState(false);
  // 5 Address Fields: House / flat /office no, Area/road name/colony, City, State, Pincode
  const [regHouseNo, setRegHouseNo] = useState('');
  const [regAreaRoad, setRegAreaRoad] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regPincode, setRegPincode] = useState('');
  // "Create password" & "Re enter password"
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // 3. FORGET PASSWORD FIELDS
  // "Email / mobile"
  const [forgotContactType, setForgotContactType] = useState<'email' | 'mobile'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCountryCode, setForgotCountryCode] = useState('+1');
  const [forgotMobile, setForgotMobile] = useState('');
  // "Request otp" & OTP code
  const [forgotOtpRequested, setForgotOtpRequested] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  // "Set new password" & "Re enter new password"
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // Switch helper
  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setDevOtpHint(null);
  };

  // ----------------------------------------------------
  // ACTION 1: LOGIN (User + Password)
  // ----------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginUser.trim()) {
      setErrorMsg('Please enter your User (Email or Mobile).');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({
        user: loginUser.trim(),
        email: loginUser.includes('@') ? loginUser.trim() : undefined,
        password: loginPassword
      });

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
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION 2: REGISTER - REQUEST OTP
  // ----------------------------------------------------
  const handleRegRequestOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setDevOtpHint(null);

    const identifier = regContactType === 'email'
      ? regEmail.trim()
      : `${regCountryCode}${regMobile.trim()}`;

    if (regContactType === 'email') {
      if (!regEmail || !regEmail.includes('@')) {
        setErrorMsg('Please provide a valid email address first.');
        return;
      }
    } else {
      if (!regMobile || regMobile.length < 5) {
        setErrorMsg('Please provide a valid mobile number.');
        return;
      }
    }

    try {
      setRegOtpLoading(true);
      const res = await api.sendOTP(identifier, regContactType === 'email' ? 'EMAIL' : 'SMS');
      if (res.success) {
        setRegOtpRequested(true);
        setSuccessMsg(res.message || `OTP sent to ${identifier}`);
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        showToast('Verification code dispatched!', 'info');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request OTP. Please try again.');
    } finally {
      setRegOtpLoading(false);
    }
  };

  // REGISTER - VERIFY OTP (Optional inline verification)
  const handleRegVerifyOtp = async () => {
    setErrorMsg('');
    const identifier = regContactType === 'email'
      ? regEmail.trim()
      : `${regCountryCode}${regMobile.trim()}`;

    if (!regOtpCode.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setRegOtpLoading(true);
      const res = await api.verifyOTP(identifier, regOtpCode.trim());
      if (res.success) {
        setRegOtpVerified(true);
        setSuccessMsg('Phone / Email verified successfully!');
        showToast('OTP verified!', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setRegOtpLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION 3: REGISTER - CREATE ACCOUNT
  // ----------------------------------------------------
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFirstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }
    if (!regSecondName.trim()) {
      setErrorMsg('Second name (Last name) is required.');
      return;
    }

    const emailVal = regContactType === 'email' ? regEmail.trim() : undefined;
    const phoneVal = regContactType === 'mobile' ? `${regCountryCode}${regMobile.trim()}` : undefined;

    if (regContactType === 'email' && (!emailVal || !emailVal.includes('@'))) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regContactType === 'mobile' && (!regMobile || regMobile.length < 5)) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }

    if (!regHouseNo.trim()) {
      setErrorMsg('Please enter your House / flat /office no.');
      return;
    }

    if (!regAreaRoad.trim()) {
      setErrorMsg('Please enter your Area/road name/colony.');
      return;
    }

    if (!regCity.trim()) {
      setErrorMsg('Please enter your City.');
      return;
    }

    if (!regState.trim()) {
      setErrorMsg('Please enter your State.');
      return;
    }

    if (!regPincode.trim()) {
      setErrorMsg('Please enter your Pincode.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please check "Re enter password".');
      return;
    }

    const fullFormattedAddress = [
      regHouseNo.trim(),
      regAreaRoad.trim(),
      regCity.trim(),
      regState.trim(),
      regPincode.trim() ? `PIN: ${regPincode.trim()}` : ''
    ].filter(Boolean).join(', ');

    const addressDetails = {
      houseNo: regHouseNo.trim(),
      areaRoad: regAreaRoad.trim(),
      city: regCity.trim(),
      state: regState.trim(),
      pincode: regPincode.trim()
    };

    try {
      setLoading(true);
      const res = await api.register({
        firstName: regFirstName.trim(),
        lastName: regSecondName.trim(),
        email: emailVal,
        phone: phoneVal,
        address: fullFormattedAddress,
        addressDetails,
        password: regPassword,
        otpCode: regOtpCode.trim() || undefined
      });

      if (res.success && res.data) {
        localStorage.setItem('sultan_auth_token', res.data.token);
        setUser(res.data.user, []);
        showToast('Account created successfully! Welcome to Fumare Hookah.', 'success');
        onNavigate('/account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION 4: FORGET PASSWORD - REQUEST OTP
  // ----------------------------------------------------
  const handleForgotRequestOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setDevOtpHint(null);

    const identifier = forgotContactType === 'email'
      ? forgotEmail.trim()
      : `${forgotCountryCode}${forgotMobile.trim()}`;

    if (forgotContactType === 'email') {
      if (!forgotEmail || !forgotEmail.includes('@')) {
        setErrorMsg('Please enter a valid registered email.');
        return;
      }
    } else {
      if (!forgotMobile || forgotMobile.length < 5) {
        setErrorMsg('Please enter a valid mobile number.');
        return;
      }
    }

    try {
      setForgotOtpLoading(true);
      const res = await api.sendOTP(identifier, forgotContactType === 'email' ? 'EMAIL' : 'SMS');
      if (res.success) {
        setForgotOtpRequested(true);
        setSuccessMsg(res.message || `OTP sent to ${identifier}`);
        if (res.devOtp) {
          setDevOtpHint(res.devOtp);
        }
        showToast('Password reset code dispatched!', 'info');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send reset OTP. Please verify details.');
    } finally {
      setForgotOtpLoading(false);
    }
  };

  // ----------------------------------------------------
  // ACTION 5: FORGET PASSWORD - RESET ("Rest")
  // ----------------------------------------------------
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const identifier = forgotContactType === 'email'
      ? forgotEmail.trim()
      : `${forgotCountryCode}${forgotMobile.trim()}`;

    if (!identifier) {
      setErrorMsg('Please enter your email or mobile number.');
      return;
    }
    if (!forgotOtpCode.trim()) {
      setErrorMsg('Please enter the OTP code you received.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify "Re enter new password".');
      return;
    }

    try {
      setLoading(true);
      const res = await api.resetPasswordOTP({
        identifier,
        code: forgotOtpCode.trim(),
        newPassword: forgotNewPassword
      });

      if (res.success) {
        showToast('Password updated! You can now log in.', 'success');
        setSuccessMsg('Your password has been successfully reset. Please log in with your new password.');
        setTimeout(() => {
          switchMode('login');
          setLoginUser(identifier);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed. Please check the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Google 1-Click fast auth fallback
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
      setErrorMsg(err.message || 'Google sign-in was cancelled or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f8f7f5] py-12 min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto">
        
        {/* Main Card */}
        <div className="bg-white border border-stone-200 rounded-sm shadow-md p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-full flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <ShieldCheck className="w-6 h-6 text-amber-800" />
            </div>
            <div className="text-[11px] uppercase font-bold tracking-[0.25em] text-amber-900/80">
              Fumare Hookah
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              {mode === 'login' && 'Login'}
              {mode === 'register' && 'Register'}
              {mode === 'forgot' && 'Forget Password'}
            </h1>
            <p className="text-xs text-stone-500">
              {mode === 'login' && 'Enter your credentials to access your account'}
              {mode === 'register' && 'Create your new customer account'}
              {mode === 'forgot' && 'Reset your password via Email or Mobile OTP'}
            </p>

            {/* Top Navigation Tabs */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xs text-xs font-semibold mt-4">
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-center rounded-xs transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Login
              </button>
              <button
                id="auth-tab-register"
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 text-center rounded-xs transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Register / New User
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div id="auth-error-banner" className="p-3 bg-rose-50 border border-rose-200 rounded-xs flex items-start gap-2.5 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div id="auth-success-banner" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-start gap-2.5 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Sandbox Development OTP Notice Banner */}
          {devOtpHint && (
            <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xs flex items-center justify-between text-amber-950 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Sandbox Security Code: <strong>{devOtpHint}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (mode === 'register') setRegOtpCode(devOtpHint);
                  if (mode === 'forgot') setForgotOtpCode(devOtpHint);
                  showToast('Code applied to field', 'info');
                }}
                className="text-[11px] font-bold text-amber-900 underline hover:text-amber-700 ml-2"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 1: LOGIN (User, Password, Login, New user / Forget password) */}
          {/* ============================================================ */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Field: User */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  User <span className="text-stone-400 font-normal">(Email / Mobile number)</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="login-user-input"
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Enter email or mobile number"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs pl-9 pr-3 py-2.5 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>
              </div>

              {/* Field: Password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs pl-9 pr-10 py-2.5 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              {/* Navigation Links: New user / Forget password */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <button
                  id="nav-to-register-btn"
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-medium text-amber-900 hover:text-amber-700 hover:underline transition-colors cursor-pointer"
                >
                  New user? Register
                </button>
                <button
                  id="nav-to-forgot-btn"
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-stone-500 hover:text-amber-900 hover:underline transition-colors cursor-pointer"
                >
                  Forget password?
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: REGISTER (New user) */}
          {/* First name, second name, Email / mobile (with country code if mobile), */}
          {/* Request otp, Adress, Create password, Re enter password, Create account */}
          {/* ============================================================ */}
          {mode === 'register' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              
              {/* First name second name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">First name *</label>
                  <input
                    id="register-firstname-input"
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Second name *</label>
                  <input
                    id="register-secondname-input"
                    type="text"
                    required
                    value={regSecondName}
                    onChange={(e) => setRegSecondName(e.target.value)}
                    placeholder="Second name"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>
              </div>

              {/* Email / mobile selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email / mobile *
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xs text-xs font-medium mb-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRegContactType('email');
                      setRegOtpRequested(false);
                      setRegOtpVerified(false);
                    }}
                    className={`py-1.5 rounded-xs text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      regContactType === 'email'
                        ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegContactType('mobile');
                      setRegOtpRequested(false);
                      setRegOtpVerified(false);
                    }}
                    className={`py-1.5 rounded-xs text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      regContactType === 'mobile'
                        ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                {/* If they use EMAIL */}
                {regContactType === 'email' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          id="register-email-input"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs pl-9 pr-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800"
                        />
                      </div>
                      <button
                        id="register-request-otp-email-btn"
                        type="button"
                        onClick={handleRegRequestOtp}
                        disabled={regOtpLoading || !regEmail}
                        className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-medium px-3 py-2 rounded-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {regOtpLoading ? 'Sending...' : 'Request otp'}
                      </button>
                    </div>
                  </div>
                )}

                {/* If they use MOBILE: Country code + Mobile number */}
                {regContactType === 'mobile' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {/* Country Code Dropdown */}
                      <div className="relative w-36 shrink-0">
                        <select
                          id="register-country-code-select"
                          value={regCountryCode}
                          onChange={(e) => setRegCountryCode(e.target.value)}
                          aria-label="Country code"
                          className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-2.5 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 appearance-none font-mono"
                        >
                          {COUNTRY_CODES.map((item) => (
                            <option key={`${item.country}-${item.code}`} value={item.code}>
                              {item.flag} {item.code} ({item.country.split('/')[0].trim()})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>

                      {/* Mobile Number Input */}
                      <input
                        id="register-mobile-input"
                        type="tel"
                        required
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        placeholder="555 123 4567"
                        className="flex-1 bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800"
                      />

                      {/* Request OTP Button */}
                      <button
                        id="register-request-otp-mobile-btn"
                        type="button"
                        onClick={handleRegRequestOtp}
                        disabled={regOtpLoading || !regMobile}
                        className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-medium px-3 py-2 rounded-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {regOtpLoading ? 'Sending...' : 'Request otp'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OTP Field (Shown after requesting or for code entry) */}
              {(regOtpRequested || regOtpCode) && (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-700">
                      Enter OTP Code *
                    </label>
                    {regOtpVerified && (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="register-otp-input"
                      type="text"
                      maxLength={6}
                      value={regOtpCode}
                      onChange={(e) => setRegOtpCode(e.target.value)}
                      placeholder="6-digit code"
                      className="flex-1 bg-white border border-stone-300 text-center font-mono tracking-widest text-sm font-bold py-1.5 px-3 rounded-xs focus:outline-none focus:border-amber-800"
                    />
                    {!regOtpVerified && (
                      <button
                        type="button"
                        onClick={handleRegVerifyOtp}
                        disabled={regOtpLoading || !regOtpCode}
                        className="bg-stone-800 hover:bg-stone-900 text-white text-xs px-3 py-1.5 rounded-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Address Fields: House/flat/office, Area/road/colony, City, State, Pincode */}
              <div className="pt-2 border-t border-stone-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-amber-800" />
                  <span>Address Details</span>
                </div>

                {/* 1. House / flat /office no */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    House / flat /office no *
                  </label>
                  <input
                    id="register-house-no-input"
                    type="text"
                    required
                    value={regHouseNo}
                    onChange={(e) => setRegHouseNo(e.target.value)}
                    placeholder="e.g. Flat 402, Building 3 / Office 12B"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>

                {/* 2. Area/road name/colony */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Area/road name/colony *
                  </label>
                  <input
                    id="register-area-road-input"
                    type="text"
                    required
                    value={regAreaRoad}
                    onChange={(e) => setRegAreaRoad(e.target.value)}
                    placeholder="e.g. MG Road, Indiranagar / Palm Jumeirah"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                </div>

                {/* 3. City & 4. State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City *
                    </label>
                    <input
                      id="register-city-input"
                      type="text"
                      required
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. Mumbai, Dubai, New York"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      State *
                    </label>
                    <input
                      id="register-state-input"
                      type="text"
                      required
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      placeholder="e.g. Maharashtra, California"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                    />
                  </div>
                </div>

                {/* 5. Pincode */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    id="register-pincode-input"
                    type="text"
                    required
                    value={regPincode}
                    onChange={(e) => setRegPincode(e.target.value)}
                    placeholder="e.g. 400001 or 560038"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Create password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Create password * <span className="text-stone-400 font-normal">(min. 6 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="register-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs pl-9 pr-10 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Re enter password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Re enter password *
                  </label>
                  {regConfirmPassword && (
                    <span className={`text-[10px] font-semibold ${
                      regPassword === regConfirmPassword ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {regPassword === regConfirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="register-confirm-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re enter your password"
                    className={`w-full bg-stone-50 border text-stone-900 text-xs pl-9 pr-3 py-2 rounded-xs focus:bg-white focus:outline-none transition-colors ${
                      regConfirmPassword && regPassword !== regConfirmPassword
                        ? 'border-rose-400 focus:border-rose-600'
                        : 'border-stone-300 focus:border-amber-800'
                    }`}
                  />
                </div>
              </div>

              {/* Create account Button */}
              <button
                id="register-create-account-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              {/* Bottom Navigation */}
              <div className="text-center pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs text-stone-600 hover:text-amber-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Already have an account? <strong>Login</strong></span>
                </button>
              </div>

            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: FORGET PASSWORD */}
          {/* Email / mobile (with country code if mobile), Request otp, */}
          {/* Set new password, Re enter new password, Rest (Reset Password) */}
          {/* ============================================================ */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotResetPassword} className="space-y-4">
              
              {/* Email / mobile selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Mail / mobile number *
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xs text-xs font-medium mb-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotContactType('email');
                      setForgotOtpRequested(false);
                    }}
                    className={`py-1.5 rounded-xs text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      forgotContactType === 'email'
                        ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotContactType('mobile');
                      setForgotOtpRequested(false);
                    }}
                    className={`py-1.5 rounded-xs text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      forgotContactType === 'mobile'
                        ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                {/* If EMAIL */}
                {forgotContactType === 'email' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          id="forgot-email-input"
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Enter registered email"
                          className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs pl-9 pr-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800"
                        />
                      </div>
                      <button
                        id="forgot-request-otp-email-btn"
                        type="button"
                        onClick={handleForgotRequestOtp}
                        disabled={forgotOtpLoading || !forgotEmail}
                        className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-medium px-3 py-2 rounded-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {forgotOtpLoading ? 'Sending...' : 'Request otp'}
                      </button>
                    </div>
                  </div>
                )}

                {/* If MOBILE: Country code + Mobile number */}
                {forgotContactType === 'mobile' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative w-36 shrink-0">
                        <select
                          id="forgot-country-code-select"
                          value={forgotCountryCode}
                          onChange={(e) => setForgotCountryCode(e.target.value)}
                          aria-label="Country code"
                          className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs px-2.5 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 appearance-none font-mono"
                        >
                          {COUNTRY_CODES.map((item) => (
                            <option key={`forgot-${item.country}-${item.code}`} value={item.code}>
                              {item.flag} {item.code} ({item.country.split('/')[0].trim()})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                      <input
                        id="forgot-mobile-input"
                        type="tel"
                        required
                        value={forgotMobile}
                        onChange={(e) => setForgotMobile(e.target.value)}
                        placeholder="555 123 4567"
                        className="flex-1 bg-stone-50 border border-stone-300 text-stone-900 text-xs px-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800"
                      />
                      <button
                        id="forgot-request-otp-mobile-btn"
                        type="button"
                        onClick={handleForgotRequestOtp}
                        disabled={forgotOtpLoading || !forgotMobile}
                        className="bg-amber-900 hover:bg-amber-800 text-white text-xs font-medium px-3 py-2 rounded-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {forgotOtpLoading ? 'Sending...' : 'Request otp'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Enter OTP Code *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="forgot-otp-input"
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtpCode}
                    onChange={(e) => setForgotOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP received"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 font-mono text-xs pl-9 pr-3 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 tracking-wider"
                  />
                </div>
              </div>

              {/* Set new password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Set new password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="forgot-new-password-input"
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs pl-9 pr-10 py-2 rounded-xs focus:bg-white focus:outline-none focus:border-amber-800 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Re enter new password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    Re enter new password *
                  </label>
                  {forgotConfirmPassword && (
                    <span className={`text-[10px] font-semibold ${
                      forgotNewPassword === forgotConfirmPassword ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {forgotNewPassword === forgotConfirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="forgot-confirm-password-input"
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Re enter your new password"
                    className={`w-full bg-stone-50 border text-stone-900 text-xs pl-9 pr-3 py-2 rounded-xs focus:bg-white focus:outline-none transition-colors ${
                      forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword
                        ? 'border-rose-400 focus:border-rose-600'
                        : 'border-stone-300 focus:border-amber-800'
                    }`}
                  />
                </div>
              </div>

              {/* Reset Button ("Rest") */}
              <button
                id="forgot-reset-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? 'Resetting password...' : 'Reset'}
              </button>

              {/* Back to Login */}
              <div className="text-center pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs text-stone-600 hover:text-amber-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Remember your password? <strong>Login</strong></span>
                </button>
              </div>

            </form>
          )}

          {/* Google 1-Click Instant Connect (Kept neat for convenience) */}
          <div className="relative border-t border-stone-200 pt-4">
            <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-2 text-[10px] uppercase font-bold text-stone-400">
              Or Fast Access
            </span>

            <button
              id="google-fast-login-btn"
              type="button"
              onClick={handleGoogleAuth}
              className="w-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-medium py-2 px-4 rounded-xs transition-colors flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
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

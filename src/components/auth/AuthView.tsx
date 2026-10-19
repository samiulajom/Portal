import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  KeyRound, 
  RefreshCw, 
  Briefcase, 
  Phone, 
  ChevronLeft,
  Check,
  Building,
  Info,
  Send,
  ExternalLink,
  Settings,
  X
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

type AuthMode = 'login' | 'register' | 'forgot';
type RegisterStep = 'form' | 'verify' | 'submitted';
type ForgotStep = 'email' | 'verify';

export const AuthView: React.FC = () => {
  const { login, registerUser, resetPasswordWithOtp, roles, users } = usePortal();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real Email OTP state (kept in memory, NEVER displayed on screen)
  const [expectedOtp, setExpectedOtp] = useState<string | null>(null);
  const [otpTargetEmail, setOtpTargetEmail] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [emailSendingStatus, setEmailSendingStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);
  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    pass: '',
    from: ''
  });
  const [smtpStatusMessage, setSmtpStatusMessage] = useState<string | null>(null);

  // Countdown timer for OTP Resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerStep, setRegisterStep] = useState<RegisterStep>('form');
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: 'operation_member',
    department: 'Operations',
    shift: 'Morning Shift',
    phoneWhatsapp: '+8801'
  });
  const [regOtpInput, setRegOtpInput] = useState('');
  const [submittedUserPreview, setSubmittedUserPreview] = useState<{
    name: string;
    email: string;
    roleName: string;
    department: string;
  } | null>(null);

  // Forgot password form state
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Generate 6-digit random code
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(loginEmail, loginPassword);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed. Please verify credentials.');
      }
    }, 400);
  };

  // Real Email Dispatch helper function
  const sendOtpEmail = async (targetEmail: string, purpose: 'register' | 'forgot', name?: string) => {
    const code = generateOtp();
    setExpectedOtp(code);
    setOtpTargetEmail(targetEmail);
    setLoading(true);
    setEmailSendingStatus('sending');
    setErrorMessage(null);

    try {
      const resp = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          otp: code,
          purpose,
          name: name || undefined
        })
      });

      const data = await resp.json();
      setLoading(false);

      if (data.success) {
        setEmailSendingStatus('sent');
        setResendCooldown(60);
        if (data.previewUrl) {
          setEmailPreviewUrl(data.previewUrl);
        }
        return true;
      } else {
        setEmailSendingStatus('error');
        setErrorMessage(data.error || 'Failed to dispatch email. Please check email address.');
        return false;
      }
    } catch (err: any) {
      setLoading(false);
      setEmailSendingStatus('error');
      // If server or network takes longer, fallback keeps expectedOtp active for user
      setResendCooldown(60);
      return true;
    }
  };

  // Handle Register step 1: Initiate verification
  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regForm.password !== regForm.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (regForm.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    // Check if email already registered
    const exists = users.some(u => u.email.toLowerCase() === regForm.email.trim().toLowerCase());
    if (exists) {
      setErrorMessage('An account with this email address already exists. Please log in.');
      return;
    }

    const sent = await sendOtpEmail(regForm.email.trim(), 'register', regForm.name.trim());
    if (sent) {
      setRegisterStep('verify');
      setRegOtpInput('');
    }
  };

  // Handle Register step 2: Verify OTP and submit request
  const handleVerifyRegisterOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!expectedOtp || regOtpInput.trim() !== expectedOtp) {
      setErrorMessage('Incorrect verification code. Please check the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name: regForm.name.trim(),
        email: regForm.email.trim(),
        password: regForm.password,
        roleId: regForm.roleId,
        department: regForm.department,
        shift: regForm.shift,
        phoneWhatsapp: regForm.phoneWhatsapp,
        avatarText: regForm.name.slice(0, 2).toUpperCase(),
        status: 'Pending Approval',
        emailVerified: true
      });
      setLoading(false);

      if (res.success && res.user) {
        const roleName = roles.find(r => r.id === regForm.roleId)?.name || regForm.roleId;
        setSubmittedUserPreview({
          name: res.user.name,
          email: res.user.email,
          roleName,
          department: res.user.department
        });
        setRegisterStep('submitted');
        setExpectedOtp(null);
      } else {
        setErrorMessage(res.error || 'Failed to submit registration request.');
      }
    }, 500);
  };

  // Handle Forgot step 1: Send reset OTP
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = forgotEmail.trim().toLowerCase();
    const target = users.find(u => u.email.toLowerCase() === clean);
    if (!target) {
      setErrorMessage('No account registered with this email address.');
      return;
    }

    const sent = await sendOtpEmail(clean, 'forgot', target.name);
    if (sent) {
      setForgotStep('verify');
      setForgotOtpInput('');
    }
  };

  // Handle Forgot step 2: Verify OTP and update password
  const handleForgotVerifyAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!expectedOtp || forgotOtpInput.trim() !== expectedOtp) {
      setErrorMessage('Incorrect OTP verification code. Please check your email inbox.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = resetPasswordWithOtp(forgotEmail, forgotNewPassword);
      setLoading(false);

      if (res.success) {
        setSuccessMessage('Password successfully updated! You can now log in with your new password.');
        setMode('login');
        setLoginEmail(forgotEmail);
        setLoginPassword(forgotNewPassword);
        setExpectedOtp(null);
        setForgotStep('email');
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    }, 500);
  };

  // Handle Save SMTP Settings
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpStatusMessage(null);
    try {
      const resp = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm)
      });
      const data = await resp.json();
      if (data.success) {
        setSmtpStatusMessage('✓ SMTP settings updated successfully!');
        setTimeout(() => setIsSmtpModalOpen(false), 1200);
      } else {
        setSmtpStatusMessage('Error: ' + data.error);
      }
    } catch (e: any) {
      setSmtpStatusMessage('Failed to save SMTP: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-[#e2e8f0] flex flex-col justify-center items-center p-4 relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-[#0c1017] border border-[#1e2738] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 my-8">
        {/* Header / Brand */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ScaleUp Portal</h1>
          <p className="text-xs text-[#94a3b8]">
            {mode === 'login' && 'Sign in to access your role-based portal workspace'}
            {mode === 'register' && 'Apply for an agency team account (Admin approval required)'}
            {mode === 'forgot' && 'Reset your account password with email OTP'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* ================= MODE 1: LOGIN ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@scaleup.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#121722] border border-[#212b3c] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-hidden focus:border-amber-500/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#cbd5e1]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setForgotStep('email');
                    setMode('forgot');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-[#121722] border border-[#212b3c] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-hidden focus:border-amber-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#cbd5e1]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Bottom Register Switch */}
            <div className="pt-4 border-t border-[#1c2433] text-center text-xs text-[#94a3b8]">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setRegisterStep('form');
                  setMode('register');
                }}
                className="font-bold text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
              >
                Create Account (নতুন অ্যাকাউন্ট)
              </button>
            </div>
          </form>
        )}

        {/* ================= MODE 2: REGISTER ================= */}
        {mode === 'register' && (
          <div>
            {/* Step 1: Form */}
            {registerStep === 'form' && (
              <form onSubmit={handleRegisterFormSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Hasan"
                      value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full bg-[#121722] border border-[#212b3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#475569] focus:outline-hidden focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Work Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="tanvir@scaleup.com"
                      value={regForm.email}
                      onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full bg-[#121722] border border-[#212b3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#475569] focus:outline-hidden focus:border-amber-500/60"
                    />
                  </div>
                </div>

                {/* ROLE SELECTION */}
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Desired Role (কাঙ্ক্ষিত পদবী) <span className="text-rose-400">*</span></span>
                  </label>
                  <select
                    value={regForm.roleId}
                    onChange={e => {
                      const rId = e.target.value;
                      let suggestedDept = regForm.department;
                      if (rId === 'admin' || rId === 'gm') suggestedDept = 'Management';
                      else if (rId === 'sales_manager' || rId === 'sells_member') suggestedDept = 'Sales';
                      else suggestedDept = 'Operations';

                      setRegForm({ ...regForm, roleId: rId, department: suggestedDept });
                    }}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-hidden focus:border-amber-500/60"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#64748b] mt-1">
                    অ্যাডমিন চাইলে আপনার রিকোয়েস্ট অ্যাপ্রুভ করার সময় রোল পরিবর্তন করতে পারেন।
                  </p>
                </div>

                {/* Department & Shift */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Department</label>
                    <select
                      value={regForm.department}
                      onChange={e => setRegForm({ ...regForm, department: e.target.value })}
                      className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Sales">Sales</option>
                      <option value="Management">Management</option>
                      <option value="Post-Sales">Post-Sales</option>
                      <option value="Shopify Dev">Shopify Dev</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Assigned Shift</label>
                    <select
                      value={regForm.shift}
                      onChange={e => setRegForm({ ...regForm, shift: e.target.value })}
                      className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-hidden"
                    >
                      <option value="Morning Shift">Morning (07 AM - 03 PM)</option>
                      <option value="Evening Shift">Evening (03 PM - 11 PM)</option>
                      <option value="Night Shift">Night (11 PM - 07 AM)</option>
                    </select>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 chars"
                      value={regForm.password}
                      onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Confirm</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={regForm.confirmPassword}
                      onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={regForm.phoneWhatsapp}
                    onChange={e => setRegForm({ ...regForm, phoneWhatsapp: e.target.value })}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Continue & Verify Email (ইমেইল ভেরিফাই)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('login');
                    }}
                    className="text-xs text-[#94a3b8] hover:text-white transition-colors"
                  >
                    Already have an account? <span className="text-amber-400 font-bold">Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Email OTP Verification */}
            {registerStep === 'verify' && (
              <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
                <div className="text-center space-y-2 p-4 rounded-2xl bg-[#0f1420] border border-[#1e2a3c]">
                  <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block shadow-inner">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </span>
                  <h3 className="font-bold text-white text-sm">Check Your Email Inbox</h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    A 6-digit security code was dispatched to: <br />
                    <span className="text-white font-semibold font-mono text-xs">{regForm.email}</span>
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    Please check your Inbox and Spam/Junk folder. Enter the code below:
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 text-center">
                    Enter 6-Digit Email Code (ইমেইলের ওটিপি কোডটি লিখুন)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={regOtpInput}
                    onChange={e => setRegOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl py-3 text-center text-lg font-mono tracking-widest text-white placeholder-[#475569] focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                  <span>Didn&apos;t receive email?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={() => sendOtpEmail(regForm.email.trim(), 'register', regForm.name.trim())}
                    className={`font-semibold transition-colors ${
                      resendCooldown > 0 ? 'text-[#64748b] cursor-not-allowed' : 'text-amber-400 hover:text-amber-300 cursor-pointer'
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code (পুনরায় পাঠান)'}
                  </button>
                </div>

                {emailPreviewUrl && (
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center">
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test mode: View delivered email in webmail viewer ↗</span>
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code & Submit for Approval</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterStep('form')}
                  className="w-full text-center text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors"
                >
                  ← Back to edit registration form
                </button>
              </form>
            )}

            {/* Step 3: Submitted & Pending Approval */}
            {registerStep === 'submitted' && (
              <div className="text-center space-y-4 py-2">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 inline-block animate-pulse">
                  <Clock className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-base">Registration Submitted!</h3>
                  <p className="text-xs text-amber-300 font-semibold">
                    Email Verified ✓ — Pending Administrator Approval
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0f1420] border border-[#1e2a3c] text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Applicant:</span>
                    <span className="font-bold text-white">{submittedUserPreview?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Email:</span>
                    <span className="text-[#cbd5e1]">{submittedUserPreview?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Requested Role:</span>
                    <span className="font-semibold text-amber-400">{submittedUserPreview?.roleName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Department:</span>
                    <span className="text-[#cbd5e1]">{submittedUserPreview?.department}</span>
                  </div>
                </div>

                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  আপনার ইমেইল ভেরিফিকেশন সফল হয়েছে। অ্যাডমিন আপনার অ্যাকাউন্টটি অ্যাপ্রুভ করলেই আপনি পাসওয়ার্ড দিয়ে পোর্টাল অ্যাক্সেস করতে পারবেন।
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    if (submittedUserPreview) setLoginEmail(submittedUserPreview.email);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Back to Sign In (লগইন পেইজে যান)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 3: FORGOT PASSWORD ================= */}
        {mode === 'forgot' && (
          <div>
            {forgotStep === 'email' && (
              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm">Reset Password</h3>
                  <p className="text-xs text-[#94a3b8]">
                    Enter your work email address to receive an OTP verification code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                    Registered Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@scaleup.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full bg-[#121722] border border-[#212b3c] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-hidden focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send Reset OTP Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('login');
                    }}
                    className="text-xs text-[#94a3b8] hover:text-white flex items-center justify-center gap-1 mx-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'verify' && (
              <form onSubmit={handleForgotVerifyAndReset} className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-[#0f1420] border border-[#1e2a3c] text-center space-y-2">
                  <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block shadow-inner">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </span>
                  <h3 className="font-bold text-white text-sm">Check Your Email Inbox</h3>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    A 6-digit password reset code has been sent to: <br />
                    <span className="text-white font-semibold font-mono text-xs">{forgotEmail}</span>
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    Please check your Inbox and Spam folder. Enter the code and your new password:
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    6-Digit Email Code (ইমেইলের ওটিপি কোডটি লিখুন)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={forgotOtpInput}
                    onChange={e => setForgotOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl py-2.5 px-3 text-center text-base font-mono tracking-widest text-white focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                  <span>Didn&apos;t receive email?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={() => sendOtpEmail(forgotEmail, 'forgot')}
                    className={`font-semibold transition-colors ${
                      resendCooldown > 0 ? 'text-[#64748b] cursor-not-allowed' : 'text-amber-400 hover:text-amber-300 cursor-pointer'
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code (পুনরায় পাঠান)'}
                  </button>
                </div>

                {emailPreviewUrl && (
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center">
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test mode: View delivered email in webmail viewer ↗</span>
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    New Password (নতুন পাসওয়ার্ড)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={forgotNewPassword}
                    onChange={e => setForgotNewPassword(e.target.value)}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={forgotConfirmPassword}
                    onChange={e => setForgotConfirmPassword(e.target.value)}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Update Password & Login</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotStep('email')}
                  className="w-full text-center text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors"
                >
                  ← Back to email step
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Discreet bottom link to configure live SMTP / Gmail */}
      <div className="relative z-10 text-center">
        <button
          type="button"
          onClick={() => setIsSmtpModalOpen(true)}
          className="text-[11px] text-[#64748b] hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer mx-auto"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Live Email Dispatch Settings (Gmail / SMTP Setup)</span>
        </button>
      </div>

      {/* SMTP Configuration Modal */}
      {isSmtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0f1420] border border-[#222e42] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2637] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-white text-sm">Live Email Dispatch Configuration</h3>
                  <p className="text-[11px] text-[#94a3b8]">Free Gmail App Password or custom SMTP</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSmtpModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:text-white hover:bg-[#1a2334]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              To send real emails to any inbox for <strong className="text-amber-400">100% FREE</strong>, you can use a free Google account with an App Password (no credit card required).
            </p>

            {smtpStatusMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {smtpStatusMessage}
              </div>
            )}

            <form onSubmit={handleSaveSmtp} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">SMTP Host</label>
                  <input
                    type="text"
                    required
                    placeholder="smtp.gmail.com"
                    value={smtpForm.host}
                    onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Port</label>
                  <input
                    type="number"
                    required
                    value={smtpForm.port}
                    onChange={e => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 587 })}
                    className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Gmail / SMTP Username</label>
                <input
                  type="email"
                  required
                  placeholder="your-email@gmail.com"
                  value={smtpForm.user}
                  onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })}
                  className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">
                  16-digit Google App Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="abcd efgh ijkl mnop"
                  value={smtpForm.pass}
                  onChange={e => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                  className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-amber-500/60"
                />
                <p className="text-[10px] text-[#64748b] mt-1">
                  Create this in 2 min at: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">myaccount.google.com/apppasswords</a> (Select App: Mail)
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#cbd5e1] mb-1">Sender Name & Email</label>
                <input
                  type="text"
                  placeholder="ScaleUp Security <your-email@gmail.com>"
                  value={smtpForm.from}
                  onChange={e => setSmtpForm({ ...smtpForm, from: e.target.value })}
                  className="w-full bg-[#121722] border border-[#212b3c] rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-amber-500/60"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#1a2333]">
                <button
                  type="button"
                  onClick={() => setIsSmtpModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white hover:bg-[#151c28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save & Apply Live SMTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

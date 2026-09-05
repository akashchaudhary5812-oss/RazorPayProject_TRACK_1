import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, Eye, EyeOff, ShieldCheck, ShoppingBag, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, User, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';

function maskEmail(emailStr) {
  if (!emailStr || !emailStr.includes('@')) return emailStr;
  const [local, domain] = emailStr.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut,
  initialTab = 'signin',
  onTabChange
}) {
  // Navigation State:
  // activeTab: 'signin' | 'signup'
  // step: 'form' | 'forgot-email' | 'otp' | 'reset-password' | 'reset-success'
  const [activeTab, setActiveTab] = useState(initialTab || 'signin');
  const [step, setStep] = useState('form');
  const [otpPurpose, setOtpPurpose] = useState('signin'); // 'signin' | 'signup' | 'password_reset'

  // Form Input States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // 6 Segmented OTP Digits
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // Timer & Status States
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 6 Segmented Input Refs
  const inputRefs = useRef([]);

  // Sync initialTab if changed
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Reset modal state upon opening
  useEffect(() => {
    if (isOpen) {
      if (!currentUser) {
        setStep('form');
        setOtpDigits(['', '', '', '', '', '']);
        setErrorMessage('');
        setStatusMessage('');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        if (initialTab) setActiveTab(initialTab);
      }
    }
  }, [isOpen, currentUser, initialTab]);

  // Countdown timer for 30s resend cooldown
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Auto-focus first OTP input when entering OTP verification step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 120);
    }
  }, [step]);

  if (!isOpen) return null;

  // ================= PROFILE VIEW (WHEN USER IS AUTHENTICATED) =================
  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-center space-y-5">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border-2 border-amber-200 shadow-xs">
            <User className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Account</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified Shopper Profile</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Name:</span>
              <strong className="text-slate-900 font-bold">{currentUser.userName || 'Shopper'}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Email:</span>
              <strong className="text-slate-900 font-bold">{currentUser.email}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Authentication:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Password + OTP Verified
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSignOut) onSignOut();
              onClose();
            }}
            className="w-full py-3 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ================= SUBMIT HANDLER (SIGN IN OR CREATE ACCOUNT) =================
  const handleSubmitForm = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const normalizedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (activeTab === 'signup' && (!name.trim() || name.trim().length < 2)) {
      setErrorMessage('Please enter your name.');
      return;
    }

    setLoading(true);

    try {
      const res = activeTab === 'signin'
        ? await authApi.login(normalizedEmail, password)
        : await authApi.register(name.trim(), normalizedEmail, password);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLoading(false);

        if (activeTab === 'signin') {
          if (res.status === 401 || res.status === 404) {
            setErrorMessage('Invalid email or password.');
            return;
          }
        }

        if (activeTab === 'signup') {
          if (data.code === 'USER_EXISTS') {
            setErrorMessage('An account already exists with this email. Please sign in.');
            return;
          }
        }

        if (data.code === 'COOLDOWN_ACTIVE') {
          setErrorMessage(data.message || 'Please wait before requesting a new code.');
          return;
        }

        if (data.code === 'TOO_MANY_REQUESTS') {
          setErrorMessage('Too many requests. Please wait a moment and try again.');
          return;
        }

        setErrorMessage(data.message || "We couldn't send the verification code. Please try again.");
        return;
      }

      // Successful credentials verification -> transition to OTP screen
      setStatusMessage('Verification code sent');
      setOtpPurpose(activeTab === 'signin' ? 'signin' : 'signup');
      setStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);

    } catch (err) {
      console.error('Auth initiation error:', err);
      setErrorMessage("We couldn't send the verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT HANDLER (FORGOT PASSWORD: REQUEST OTP) =================
  const handleForgotEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const normalizedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.forgotPassword(normalizedEmail);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'COOLDOWN_ACTIVE') {
          setErrorMessage(data.message || 'Please wait before requesting a new code.');
        } else if (data.code === 'TOO_MANY_REQUESTS') {
          setErrorMessage('Too many requests. Please wait a moment and try again.');
        } else {
          setErrorMessage(data.message || "We couldn't send the verification code. Please try again.");
        }
        return;
      }

      // Transition to OTP verification specifically for password reset
      setStatusMessage(data.message || "If an account exists for this email, we've sent a verification code.");
      setOtpPurpose('password_reset');
      setStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);

    } catch (err) {
      console.error('Forgot password error:', err);
      setErrorMessage("We couldn't send the verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await authApi.resendOtp(email.trim(), otpPurpose);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'TOO_MANY_REQUESTS') {
          setErrorMessage('Too many requests. Please wait a moment and try again.');
        } else if (data.code === 'COOLDOWN_ACTIVE') {
          setErrorMessage(data.message || 'Please wait before requesting a new code.');
        } else {
          setErrorMessage(data.message || "We couldn't send the verification code. Please try again.");
        }
        return;
      }

      setStatusMessage('Verification code sent');
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);

    } catch (err) {
      console.error('Resend OTP error:', err);
      setErrorMessage("We couldn't send the verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= 6-DIGIT SEGMENTED OTP INPUT HANDLERS =================
  const handleOtpChange = (index, value) => {
    setErrorMessage('');
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue ? cleanValue.slice(-1) : '';
    setOtpDigits(newDigits);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);

    const nextEmptyIndex = newDigits.findIndex((d) => d === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6) {
      setErrorMessage("That verification code isn't correct. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // If password reset, call /api/verify-reset-otp to receive server resetToken
      if (otpPurpose === 'password_reset') {
        const res = await authApi.verifyResetOtp(email.trim(), fullOtp);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (data.code === 'EXPIRED') {
            setErrorMessage('This verification code has expired. Please request a new code.');
          } else if (data.code === 'TOO_MANY_ATTEMPTS') {
            setErrorMessage('Too many incorrect attempts. Please request a new verification code.');
          } else if (data.code === 'INCORRECT') {
            setErrorMessage("That verification code isn't correct. Please try again.");
          } else {
            setErrorMessage(data.message || "That verification code isn't correct. Please try again.");
          }
          return;
        }

        // Successfully verified password-reset OTP -> transition to Create New Password screen
        setResetToken(data.resetToken);
        setStep('reset-password');
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage('');
        setStatusMessage('');
        return;
      }

      // Normal Sign In / Sign Up OTP verification
      const res = await authApi.verifyOtp(email.trim(), fullOtp);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'EXPIRED') {
          setErrorMessage('This verification code has expired. Please request a new one.');
        } else if (data.code === 'TOO_MANY_ATTEMPTS') {
          setErrorMessage('Too many attempts. Please request a new verification code.');
        } else if (data.code === 'INCORRECT') {
          setErrorMessage("That verification code isn't correct. Please try again.");
        } else {
          setErrorMessage(data.message || "That verification code isn't correct. Please try again.");
        }
        return;
      }

      setStatusMessage('Signed in successfully!');

      const authenticatedUser = {
        _id: data.user?._id,
        userName: data.user?.userName || name || email.split('@')[0],
        email: data.user?.email || email,
        token: data.token
      };

      setTimeout(() => {
        onAuthSuccess(authenticatedUser);
        onClose();
      }, 400);

    } catch (err) {
      console.error('Verify OTP error:', err);
      setErrorMessage("That verification code isn't correct. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT HANDLER (RESET PASSWORD: SET NEW PASSWORD) =================
  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Please choose a stronger password (at least 6 characters).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword(email.trim(), resetToken, newPassword, confirmPassword);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'INVALID_RESET_SESSION') {
          setErrorMessage('Your password reset session has expired. Please request a new code.');
        } else {
          setErrorMessage(data.message || 'Failed to update password. Please try again.');
        }
        return;
      }

      // Password updated successfully -> transition to final Success screen
      setStep('reset-success');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');

    } catch (err) {
      console.error('Reset password error:', err);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Link for Secondary Steps */}
        {step === 'forgot-email' && (
          <button
            type="button"
            id="auth-back-to-signin-btn"
            onClick={() => {
              setStep('form');
              setActiveTab('signin');
              setErrorMessage('');
              setStatusMessage('');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        )}

        {step === 'otp' && (
          <button
            type="button"
            id="auth-back-button"
            onClick={() => {
              if (otpPurpose === 'password_reset') {
                setStep('forgot-email');
              } else {
                setStep('form');
              }
              setErrorMessage('');
              setStatusMessage('');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {otpPurpose === 'password_reset'
                ? 'Back to Forgot Password'
                : `Back to ${activeTab === 'signin' ? 'Sign In' : 'Create account'}`}
            </span>
          </button>
        )}

        {step === 'reset-password' && (
          <button
            type="button"
            id="auth-back-from-reset-btn"
            onClick={() => {
              setStep('forgot-email');
              setErrorMessage('');
              setStatusMessage('');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Forgot Password</span>
          </button>
        )}

        {/* Amazon-Style Header */}
        <div className="text-center pb-3 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <img
              src="https://ik.imagekit.io/8uutsqtnj/INTENT_CART_AI_LOGO.png"
              alt="IntentCartAI"
              className="w-3.5 h-3.5 object-contain"
            />
            IntentCartAI Security
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 'form' && (activeTab === 'signin' ? 'Sign in' : 'Create account')}
            {step === 'forgot-email' && 'Forgot your password?'}
            {step === 'otp' && 'Verify your email'}
            {step === 'reset-password' && 'Create a new password'}
            {step === 'reset-success' && 'Password changed successfully'}
          </h2>

          {step === 'forgot-email' && (
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed pt-1">
              Enter the email address associated with your account and we'll send you a verification code.
            </p>
          )}

          {step === 'otp' && (
            <p className="text-xs text-slate-500">
              Enter the 6-digit verification code sent to your email.
            </p>
          )}

          {step === 'otp' && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                {maskEmail(email)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep(otpPurpose === 'password_reset' ? 'forgot-email' : 'form');
                  setErrorMessage('');
                }}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {step === 'reset-password' && (
            <p className="text-xs text-slate-500 pt-1">
              Please enter and confirm your new password below.
            </p>
          )}

          {step === 'reset-success' && (
            <p className="text-xs text-slate-500 pt-1 max-w-sm mx-auto">
              Your password has been updated. You can now sign in with your new password.
            </p>
          )}
        </div>

        {/* Status / Error Alerts */}
        <div className="my-2">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {statusMessage && !errorMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* ================= STEP 1: CREDENTIAL FORM (SIGN IN OR CREATE ACCOUNT) ================= */}
        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            
            {/* Name Field (Create Account only) */}
            {activeTab === 'signup' && (
              <div>
                <label htmlFor="auth-name-input" className="text-xs font-bold text-slate-800 block mb-1">
                  Your name
                </label>
                <div className="relative">
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#e77600] focus:ring-2 focus:ring-[#f0b800]/40 focus:outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="auth-email-input" className="text-xs font-bold text-slate-800 block mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  autoFocus={activeTab === 'signin'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your email"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#e77600] focus:ring-2 focus:ring-[#f0b800]/40 focus:outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="auth-password-input" className="text-xs font-bold text-slate-800 block">
                  Password
                </label>
                {activeTab === 'signup' && (
                  <span className="text-[11px] text-slate-500">At least 6 characters</span>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder={activeTab === 'signin' ? 'Enter your password' : 'Create a password'}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#e77600] focus:ring-2 focus:ring-[#f0b800]/40 focus:outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password Link (Below Password Field on Sign In) */}
              {activeTab === 'signin' && (
                <div className="flex justify-end pt-1.5">
                  <button
                    type="button"
                    id="auth-forgot-password-link"
                    onClick={() => {
                      setStep('forgot-email');
                      setOtpPurpose('password_reset');
                      setErrorMessage('');
                      setStatusMessage('');
                    }}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              id="auth-submit-button"
              disabled={loading || !email.trim() || !password || (activeTab === 'signup' && !name.trim())}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-bold py-3 rounded-lg text-sm shadow-xs border border-[#FCD200] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>

            {/* Terms Disclaimer */}
            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              By continuing, you agree to BundleAI's Conditions of Use and Privacy Notice.
            </p>

            {/* Section Switcher (Sign In <-> Create Account) */}
            <div className="pt-3 border-t border-slate-200">
              {activeTab === 'signin' ? (
                <div className="text-center space-y-2">
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-2 text-[11px] text-slate-400 uppercase tracking-wider">New to BundleAI?</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                  <button
                    type="button"
                    id="auth-switch-to-signup"
                    onClick={() => {
                      setActiveTab('signup');
                      if (onTabChange) onTabChange('signup');
                      setErrorMessage('');
                      setStatusMessage('');
                    }}
                    className="w-full py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    New customer? Create your account
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-2 text-[11px] text-slate-400 uppercase tracking-wider">Already a customer?</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                  <button
                    type="button"
                    id="auth-switch-to-signin"
                    onClick={() => {
                      setActiveTab('signin');
                      if (onTabChange) onTabChange('signin');
                      setErrorMessage('');
                      setStatusMessage('');
                    }}
                    className="w-full py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              )}
            </div>

          </form>
        )}

        {/* ================= STEP 2: FORGOT PASSWORD EMAIL SCREEN ================= */}
        {step === 'forgot-email' && (
          <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email-input" className="text-xs font-bold text-slate-800 block mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  id="forgot-email-input"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your email"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#e77600] focus:ring-2 focus:ring-[#f0b800]/40 focus:outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              id="forgot-submit-button"
              disabled={loading || !email.trim()}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-bold py-3 rounded-lg text-sm shadow-xs border border-[#FCD200] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send verification code</span>
              )}
            </button>

            <div className="pt-3 border-t border-slate-200 text-center">
              <button
                type="button"
                id="forgot-back-to-signin-link"
                onClick={() => {
                  setStep('form');
                  setActiveTab('signin');
                  setErrorMessage('');
                  setStatusMessage('');
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: 6-DIGIT OTP VERIFICATION ================= */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-3 text-center">
                Enter the 6-digit verification code
              </label>

              {/* 6 Individual Segmented Input Boxes */}
              <div
                className="flex items-center justify-center gap-2 sm:gap-2.5"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-all ${
                      errorMessage
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400 text-rose-700'
                        : digit
                        ? 'border-slate-800 focus:ring-2 focus:ring-amber-400 text-slate-900'
                        : 'border-slate-300 focus:ring-2 focus:ring-amber-400 text-slate-900'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Verify CTA */}
            <button
              type="submit"
              id="otp-verify-button"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-bold py-3.5 rounded-lg text-sm border border-[#FCD200] shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify code</span>
              )}
            </button>

            {/* Resend Code with 30s Countdown */}
            <div className="text-center pt-1">
              {resendTimer > 0 ? (
                <span className="text-xs text-slate-500 font-medium">
                  Resend code in <strong className="text-slate-800 font-bold">{resendTimer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  id="otp-resend-button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 underline transition-colors cursor-pointer"
                >
                  Resend code
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>
                {otpPurpose === 'password_reset' ? 'Password reset verification' : 'Two-factor email authentication'}
              </span>
            </div>
          </form>
        )}

        {/* ================= STEP 4: CREATE NEW PASSWORD ================= */}
        {step === 'reset-password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="reset-new-password" className="text-xs font-bold text-slate-800 block">
                  New Password
                </label>
                <span className="text-[11px] text-slate-500">At least 6 characters</span>
              </div>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your new password"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#e77600] focus:ring-2 focus:ring-[#f0b800]/40 focus:outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reset-confirm-password" className="text-xs font-bold text-slate-800 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Confirm your new password"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-10 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#e77600] focus:ring-2 focus:ring-[#f0b800]/40 focus:outline-none transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Change Password CTA */}
            <button
              type="submit"
              id="reset-change-password-button"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-bold py-3 rounded-lg text-sm shadow-xs border border-[#FCD200] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </form>
        )}

        {/* ================= STEP 5: PASSWORD CHANGED SUCCESS ================= */}
        {step === 'reset-success' && (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              Your password has been updated securely. You can now use your new password to sign in.
            </div>

            <button
              type="button"
              id="auth-reset-signin-button"
              onClick={() => {
                setStep('form');
                setActiveTab('signin');
                setErrorMessage('');
                setStatusMessage('');
                setPassword('');
              }}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-slate-950 font-bold py-3 rounded-lg text-sm shadow-xs border border-[#FCD200] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

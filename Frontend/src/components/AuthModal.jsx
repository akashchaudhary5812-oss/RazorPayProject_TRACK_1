import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, ShieldCheck, ShoppingBag, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, User, ArrowRight, ExternalLink } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut
}) {
  // Navigation State: active tab ('signin' | 'signup') and step ('form' | 'otp')
  const [activeTab, setActiveTab] = useState('signin');
  const [step, setStep] = useState('form');

  // Input States
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // Timer & Status States
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [domainRestrictionInfo, setDomainRestrictionInfo] = useState(null);

  // 6 Segmented Input Refs
  const inputRefs = useRef([]);

  // Reset modal state upon opening
  useEffect(() => {
    if (isOpen) {
      if (!currentUser) {
        setStep('form');
        setOtpDigits(['', '', '', '', '', '']);
        setErrorMessage('');
        setErrorCode('');
        setStatusMessage('');
        setDomainRestrictionInfo(null);
      }
    }
  }, [isOpen, currentUser]);

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
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-center space-y-5">
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

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
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
                <CheckCircle2 className="w-3.5 h-3.5" /> Email OTP Verified
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

  // ================= SEND OTP (SIGN IN / CREATE ACCOUNT) =================
  const handleInitiateAuth = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setErrorCode('');
    setDomainRestrictionInfo(null);
    setStatusMessage('Sending verification code...');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setLoading(false);
      setStatusMessage('');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (activeTab === 'signup' && !fullName.trim()) {
      setLoading(false);
      setStatusMessage('');
      setErrorMessage('Please enter your full name.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: activeTab,
          fullName: activeTab === 'signup' ? fullName.trim() : undefined
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLoading(false);
        setStatusMessage('');
        setErrorCode(data.code || '');

        if (data.code === 'USER_NOT_FOUND') {
          setErrorMessage('No account found with this email. Please create an account.');
          return;
        }

        if (data.code === 'USER_EXISTS') {
          setErrorMessage('An account already exists with this email. Please sign in.');
          return;
        }

        if (data.code === 'COOLDOWN_ACTIVE') {
          setErrorMessage(data.message || 'Please wait before requesting a new code.');
          return;
        }

        if (data.code === 'TOO_MANY_REQUESTS') {
          setErrorMessage('Too many attempts. Please try again later.');
          return;
        }

        if (data.code === 'RESEND_DOMAIN_RESTRICTION') {
          setErrorMessage('Email delivery restricted: Resend free tier only delivers to the account owner (abhishekyadav44998@gmail.com).');
          setDomainRestrictionInfo({
            message: data.message,
            helpUrl: data.details?.helpUrl || 'https://resend.com/domains'
          });
          return;
        }

        setErrorMessage(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // Successful OTP generation & transmission
      setStatusMessage('Verification code sent to your email.');
      setStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);

    } catch (err) {
      console.error('Initiate Auth Error:', err);
      setErrorMessage('Something went wrong. Please check your network and try again.');
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    await handleInitiateAuth();
  };

  // ================= 6-DIGIT SEGMENTED OTP INPUT HANDLERS =================
  const handleOtpChange = (index, value) => {
    setErrorMessage('');

    // Accept numeric characters only
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue ? cleanValue.slice(-1) : '';
    setOtpDigits(newDigits);

    // Auto-advance to next input
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

    // Focus last or next empty input
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
      setErrorMessage("That code isn't correct. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: fullOtp,
          fullName: activeTab === 'signup' ? fullName.trim() : undefined
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'EXPIRED') {
          setErrorMessage('This code has expired. Please request a new one.');
        } else if (data.code === 'TOO_MANY_ATTEMPTS') {
          setErrorMessage('Too many attempts. Please try again later.');
        } else if (data.code === 'INCORRECT' || data.code === 'INVALID_LENGTH') {
          setErrorMessage("That code isn't correct. Please try again.");
        } else {
          setErrorMessage('Something went wrong. Please try again.');
        }
        return;
      }

      // Success
      setStatusMessage('Signed in successfully!');

      const authenticatedUser = {
        userName: data.user?.userName || fullName || email.split('@')[0],
        email: data.user?.email || email,
        token: data.token
      };

      setTimeout(() => {
        onAuthSuccess(authenticatedUser);
        onClose();
      }, 500);

    } catch (err) {
      console.error('Verify OTP Error:', err);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= TOP TAB SWITCHER: SIGN IN | CREATE ACCOUNT ================= */}
        {step === 'form' && (
          <div className="flex border-b border-slate-200 mb-5">
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage('');
                setErrorCode('');
                setStatusMessage('');
                setDomainRestrictionInfo(null);
              }}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'border-[#F7CA00] text-slate-900 bg-amber-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage('');
                setErrorCode('');
                setStatusMessage('');
                setDomainRestrictionInfo(null);
              }}
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'border-[#F7CA00] text-slate-900 bg-amber-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Create account
            </button>
          </div>
        )}

        {/* Back Link for OTP Step */}
        {step === 'otp' && (
          <button
            type="button"
            id="auth-back-button"
            onClick={() => {
              setStep('form');
              setErrorMessage('');
              setErrorCode('');
              setStatusMessage('');
              setDomainRestrictionInfo(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {activeTab === 'signin' ? 'Sign in' : 'Create account'}</span>
          </button>
        )}

        {/* Brand / Step Header */}
        <div className="text-center pb-3 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <img
              src="https://ik.imagekit.io/8uutsqtnj/INTENT_CART_AI_LOGO.png"
              alt="IntentCartAI"
              className="w-3.5 h-3.5 object-contain"
            />
            IntentCartAI Security
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {step === 'form'
              ? activeTab === 'signin'
                ? 'Welcome back'
                : 'Create Account'
              : 'Verify your email'}
          </h2>
          
          <p className="text-xs text-slate-500">
            {step === 'form'
              ? activeTab === 'signin'
                ? 'Enter your email to receive a secure one-time verification code.'
                : 'Enter your details to create your account.'
              : "We've sent a 6-digit verification code to your email."}
          </p>

          {step === 'otp' && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                {email}
              </span>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Status / Error Alerts */}
        <div className="my-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>

              {/* Quick switch helper for user not found */}
              {errorCode === 'USER_NOT_FOUND' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage('');
                    setErrorCode('');
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  <span>Create an account instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick switch helper for user exists */}
              {errorCode === 'USER_EXISTS' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage('');
                    setErrorCode('');
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  <span>Sign in to your existing account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Helpful domain explanation if Resend sandbox restriction triggers */}
              {domainRestrictionInfo && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] text-slate-600 space-y-1">
                  <p>
                    Resend free sandbox uses <code>onboarding@resend.dev</code> which only delivers to the Resend account owner.
                  </p>
                  <a
                    href={domainRestrictionInfo.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline"
                  >
                    <span>Configure domain at Resend.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {statusMessage && !errorMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* ================= STEP 1: FORM (SIGN IN OR CREATE ACCOUNT) ================= */}
        {step === 'form' && (
          <form onSubmit={handleInitiateAuth} className="space-y-4">
            
            {/* Full Name field (Only shown for Create Account) */}
            {activeTab === 'signup' && (
              <div>
                <label htmlFor="auth-name-input" className="text-xs font-bold text-slate-700 block mb-1">
                  Your name
                </label>
                <div className="relative">
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    autoFocus
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="First and last name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            {/* Email Field (Used for both tabs) */}
            <div>
              <label htmlFor="auth-email-input" className="text-xs font-bold text-slate-700 block mb-1">
                {activeTab === 'signin' ? 'Enter your email' : 'Email address'}
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
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              id="auth-submit-button"
              disabled={loading || !email.trim() || (activeTab === 'signup' && !fullName.trim())}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:scale-98 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending verification code...</span>
                </>
              ) : (
                <span>{activeTab === 'signin' ? 'Continue' : 'Create Account'}</span>
              )}
            </button>
          </form>
        )}

        {/* ================= STEP 2: 6-DIGIT OTP VERIFICATION ================= */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-3 text-center">
                6-digit verification code
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

            {/* Verify & Sign In CTA */}
            <button
              type="submit"
              id="otp-verify-button"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:scale-98 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Sign In</span>
              )}
            </button>

            {/* Resend Code with 30s Countdown */}
            <div className="text-center pt-1">
              {resendTimer > 0 ? (
                <span className="text-xs text-slate-500 font-semibold">
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
          </form>
        )}

        {/* Amazon-Style Security Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500 space-y-1.5">
          <p>
            By continuing, you agree to our Terms of Use and Privacy Notice.
          </p>
          <div className="flex items-center justify-center gap-1 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Secure passwordless authentication with Email OTP</span>
          </div>
        </div>

      </div>
    </div>
  );
}

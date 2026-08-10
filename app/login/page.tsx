'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();

  // Login form state
  const [email, setEmail] = useState('grace.hopper@smms.edu');
  const [password, setPassword] = useState('Password@123');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const canResend = timer === 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both your institutional email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await login(email, password);
      if (res.success) {
        setStep('otp');
        setTimer(60);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Network connection failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal && val) return; // Discard non-numeric
    const char = cleanVal ? cleanVal.slice(-1) : '';

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next input
    if (char && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    const targetIndex = Math.min(pasteData.length, 5);
    const targetInput = document.getElementById(`otp-input-${targetIndex}`);
    targetInput?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the authentication OTP.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await verifyOtp(email, enteredCode);
      if (!res.success) {
        setErrorMessage('Invalid or expired OTP code.');
      }
    } catch {
      setErrorMessage('Authentication service error.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign In to SMMS
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          Student Mentoring Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700">
                  Institutional Email
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@smms.edu"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">2FA via Email OTP required</span>
                <Link
                  href="/change-password"
                  className="font-medium text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:outline-none rounded"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Proceed to 2FA Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Credentials */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  1-Click Quick Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('john.doe@student.smms.edu')}
                    className="p-2 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                  >
                    Student (John)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('grace.hopper@smms.edu')}
                    className="p-2 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                  >
                    Mentor (Dr. Hopper)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('coordinator@smms.edu')}
                    className="p-2 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                  >
                    Coordinator (Prof. Ada)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('admin@smms.edu')}
                    className="p-2 text-left rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none transition-colors"
                  >
                    Admin (Dr. Turing)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Step 2: 6-Digit Email OTP Verification */
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Enter Two-Factor OTP</h2>
                <p className="text-xs text-slate-500 mt-1">
                  We sent a 6-digit verification code to <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>

              {/* 6 Digits Input */}
              <fieldset className="border-0 p-0 m-0">
                <legend className="sr-only">Enter 6-digit verification code</legend>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      aria-label={`Digit ${idx + 1} of 6`}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 bg-white"
                    />
                  ))}
                </div>
              </fieldset>

              <p className="text-center text-[11px] text-slate-500">
                (Demo note: type any 6 digits e.g. <span className="font-mono text-slate-700 font-semibold">123456</span>)
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify Code & Sign In</span>
                  </>
                )}
              </button>

              {/* Countdown & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-slate-600 hover:text-slate-900 focus-visible:ring-1 focus-visible:ring-slate-900 rounded"
                >
                  ← Back to login
                </button>
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTimer(60);
                    }}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:ring-1 focus-visible:ring-indigo-800 rounded"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="text-slate-500">Resend in {timer}s</span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

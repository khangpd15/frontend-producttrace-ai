import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authApi } from '../api/auth.api';

type Step = 'request' | 'reset';
type AlertType = 'info' | 'success' | 'error';

interface AlertState {
  type: AlertType;
  message: string;
}

// ─── Parse lỗi backend đúng cách ─────────────────────────────────────────────
function parseBackendError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data) {
      // Backend trả về { message, error, data }
      const msg = data.message || data.error;
      if (
        msg &&
        typeof msg === 'string' &&
        !msg.includes('INTERNAL_ERROR') &&
        !msg.includes('gorm') &&
        !msg.includes('SQL')
      ) {
        return msg;
      }
    }
    const status = err.response?.status;
    if (status === 400) return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
    if (status === 404) return 'Email không tồn tại trong hệ thống.';
    if (status === 429) return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';
    if (!err.response) return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.';
  }
  if (err instanceof Error) return err.message;
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}

// ─── Inline Alert Component ───────────────────────────────────────────────────
function Alert({ alert }: { alert: AlertState }) {
  const styles: Record<AlertType, { wrapper: string; icon: string }> = {
    info: {
      wrapper: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: 'ℹ️',
    },
    success: {
      wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: '✅',
    },
    error: {
      wrapper: 'bg-red-50 border-red-200 text-red-700',
      icon: '❌',
    },
  };

  const { wrapper, icon } = styles[alert.type];

  return (
    <div
      className={`flex items-start gap-2.5 p-3.5 border rounded-xl text-sm animate-fadeIn ${wrapper}`}
      role="alert"
    >
      <span className="mt-px text-base leading-none flex-shrink-0">{icon}</span>
      <span className="leading-snug">{alert.message}</span>
    </div>
  );
}

// ─── Countdown Redirect Toast ─────────────────────────────────────────────────
function SuccessToast({ countdown }: { countdown: number }) {
  return (
    <div
      className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm animate-fadeIn"
      role="status"
      aria-live="polite"
    >
      <span className="mt-px text-base leading-none flex-shrink-0">✅</span>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-emerald-800">Đặt lại mật khẩu thành công!</span>
        <span className="text-emerald-700">
          Bạn sẽ được chuyển đến trang đăng nhập sau{' '}
          <span className="font-bold tabular-nums">{countdown}</span> giây.
        </span>
        {/* Progress bar */}
        <div className="mt-1.5 w-full bg-emerald-200 rounded-full h-1 overflow-hidden">
          <div
            className="h-1 bg-emerald-500 rounded-full transition-all ease-linear"
            style={{
              width: `${(countdown / 3) * 100}%`,
              transitionDuration: '1000ms',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp_code: '', new_password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Cleanup interval on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ─── Auto-redirect sau 3 giây khi thành công ───────────────────────────────
  const startCountdownRedirect = () => {
    setIsSuccess(true);
    setCountdown(3);

    let remaining = 3;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        navigate('/login', {
          state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' },
        });
      }
    }, 1000);
  };

  // ─── Step 1: Gửi email lấy OTP ─────────────────────────────────────────────
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);
    try {
      await authApi.forgotPassword({ email });
      setAlert({
        type: 'info',
        message: 'Nếu email đã đăng ký, bạn sẽ nhận được mã OTP trong vài giây.',
      });
      setStep('reset');
    } catch (err) {
      setAlert({ type: 'error', message: parseBackendError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Đặt lại mật khẩu ─────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (form.new_password !== form.confirmPassword) {
      setAlert({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (form.otp_code.trim().length < 4) {
      setAlert({ type: 'error', message: 'Mã OTP không hợp lệ.' });
      return;
    }

    setIsLoading(true);
    setAlert(null);
    try {
      await authApi.resetPassword({
        email,
        otp_code: form.otp_code.trim(),
        new_password: form.new_password,
      });
      // ✅ Thành công: bắt đầu countdown redirect
      startCountdownRedirect();
    } catch (err) {
      setAlert({ type: 'error', message: parseBackendError(err) });
      setIsLoading(false);
    }
    // Không có finally setIsLoading(false) vì khi thành công
    // muốn giữ trạng thái disabled cho đến khi redirect
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>

      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
            PT
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {step === 'request' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
          </h1>
          {step === 'reset' && !isSuccess && (
            <p className="text-xs text-slate-500">
              Nhập mã OTP đã gửi đến <span className="font-semibold text-slate-700">{email}</span>
            </p>
          )}
        </div>

        {/* Success countdown toast */}
        {isSuccess && <SuccessToast countdown={countdown} />}

        {/* Alert (info / error) */}
        {!isSuccess && alert && <Alert alert={alert} />}

        {/* ── Step 1: Request OTP ─────────────────────────────────────────── */}
        {step === 'request' && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="fp-email">
                Email đã đăng ký
              </label>
              <input
                id="fp-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors shadow-md cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang gửi...
                </span>
              ) : (
                'Gửi mã OTP'
              )}
            </button>
          </form>
        )}

        {/* ── Step 2: Reset Password ──────────────────────────────────────── */}
        {step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            {[
              { name: 'otp_code',       label: 'Mã OTP',          type: 'text',     placeholder: '123456',    autocomplete: 'one-time-code' },
              { name: 'new_password',   label: 'Mật khẩu mới',    type: 'password', placeholder: '••••••••',  autocomplete: 'new-password' },
              { name: 'confirmPassword',label: 'Xác nhận mật khẩu',type: 'password', placeholder: '••••••••', autocomplete: 'new-password' },
            ].map(({ name, label, type, placeholder, autocomplete }) => (
              <div key={name} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700" htmlFor={`fp-${name}`}>
                  {label}
                </label>
                <input
                  id={`fp-${name}`}
                  name={name}
                  type={type}
                  required
                  autoComplete={autocomplete}
                  disabled={isSuccess}
                  value={form[name as keyof typeof form]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors shadow-md cursor-pointer"
            >
              {isLoading && !isSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Đã đặt lại thành công
                </span>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </form>
        )}

        {/* Footer link */}
        {!isSuccess && (
          <p className="text-center text-xs text-slate-400">
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              ← Quay lại đăng nhập
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type Toast, type ToastType } from '../../../hooks/useToast';

const CONFIG: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; text: string; bar: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    bar: 'bg-green-400',
  },
  error: {
    icon: <XCircle size={18} />,
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    bar: 'bg-red-400',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    bar: 'bg-yellow-400',
  },
  info: {
    icon: <Info size={18} />,
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-800',
    bar: 'bg-blue-400',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = CONFIG[toast.type];

  useEffect(() => {
    // Slide in
    const t = setTimeout(() => setVisible(true), 10);
    // Progress bar
    const start = Date.now();
    const duration = 4000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
    }, 50);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 min-w-[280px] max-w-[360px] px-4 py-3
        rounded-lg border-l-4 shadow-md overflow-hidden
        transition-all duration-300 ease-in-out
        ${cfg.bg} ${cfg.border} ${cfg.text}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {/* Icon */}
      <span className="mt-0.5 shrink-0">{cfg.icon}</span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 transition-all ${cfg.bar}`}
        style={{ width: `${progress}%`, transitionDuration: '50ms' }}
      />
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}

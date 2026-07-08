import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AlertCard({ type, message }: { type: 'warning' | 'error', message: string }) {
  const Icon = type === 'warning' ? AlertTriangle : ShieldAlert;
  const color = type === 'warning' ? 'text-warning' : 'text-error';
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-surface border border-border ${color}`}>
      <Icon size={18} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

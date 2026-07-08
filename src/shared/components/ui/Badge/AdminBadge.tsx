import React from 'react';

type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export default function Badge({ status }: { status: Status }) {
  const styles = {
    ACTIVE: 'bg-green-100 text-success',
    INACTIVE: 'bg-slate-100 text-slate-500',
    PENDING: 'bg-amber-100 text-warning',
    APPROVED: 'bg-blue-100 text-primary',
    REJECTED: 'bg-red-100 text-error',
    EXPIRED: 'bg-red-100 text-error',
    CANCELLED: 'bg-slate-100 text-slate-500',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

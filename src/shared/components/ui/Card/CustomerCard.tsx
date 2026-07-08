import React, { ReactNode } from 'react';

export function Card({ children, className = '', onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div onClick={onClick} className={`bg-white border border-slate-100 rounded-2xl shadow-sm ${className}`} {...props}>{children}</div>;
}

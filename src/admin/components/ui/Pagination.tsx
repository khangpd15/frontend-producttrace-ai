import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isLoading?: boolean;
  className?: string;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Pagination({
  page,
  limit,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
  isLoading = false,
  className = '',
}: PaginationProps) {
  if (totalItems === 0) return null;

  const from = Math.min((page - 1) * limit + 1, totalItems);
  const to = Math.min(page * limit, totalItems);

  // Build page number array with ellipsis
  const buildPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = buildPageNumbers();

  const btnBase =
    'inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';
  const btnNormal = `${btnBase} bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300`;
  const btnActive = `${btnBase} bg-blue-600 border-blue-600 text-white shadow-sm`;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-white border-t border-slate-100 ${className}`}
    >
      {/* Left: Info + rows per page */}
      <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
        <span>
          Hiển thị{' '}
          <span className="font-semibold text-slate-700">{from}–{to}</span> /{' '}
          <span className="font-semibold text-slate-700">{totalItems}</span> bản ghi
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5">
            <span className="whitespace-nowrap">Dòng/trang:</span>
            <select
              value={limit}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
                onPageChange(1);
              }}
              disabled={isLoading}
              className="bg-white border border-slate-200 rounded-lg text-xs py-1 pl-2 pr-5 cursor-pointer focus:outline-none focus:border-blue-400 disabled:opacity-50"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1 || isLoading}
            className={btnNormal}
            title="Trang đầu"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Prev page */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className={btnNormal}
            title="Trang trước"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex items-center justify-center min-w-[32px] h-8 text-xs text-slate-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={p === page ? btnActive : btnNormal}
              >
                {p}
              </button>
            )
          )}

          {/* Next page */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || isLoading}
            className={btnNormal}
            title="Trang sau"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages || isLoading}
            className={btnNormal}
            title="Trang cuối"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

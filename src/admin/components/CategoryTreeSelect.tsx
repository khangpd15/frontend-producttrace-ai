import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown, Folder, Search, Check, Ban } from 'lucide-react';
import { AdminCategory as Category } from '@shared/types/domain';

interface CategoryTreeSelectProps {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** Các category không được phép chọn làm cha (vd: chính nó + toàn bộ hậu duệ khi đang sửa) */
  disabledIds?: string[];
  disabled?: boolean;
  placeholder?: string;
}

// Lấy toàn bộ id hậu duệ (con, cháu, chắt...) của 1 category
export function getDescendantIds(categories: Category[], rootId: string): string[] {
  const result: string[] = [];
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop() as string;
    for (const child of categories.filter(c => c.parentId === current)) {
      result.push(child.id);
      stack.push(child.id);
    }
  }
  return result;
}

// Lấy chuỗi id tổ tiên (cha, ông, cụ...) của 1 category, từ gần -> xa
function getAncestorIds(categories: Category[], id: string): string[] {
  const result: string[] = [];
  let current = categories.find(c => c.id === id);
  while (current?.parentId) {
    result.push(current.parentId);
    current = categories.find(c => c.id === current!.parentId);
  }
  return result;
}

// Đường dẫn hiển thị dạng "Cha / Con / Cháu"
function getPathLabel(categories: Category[], id: string): string {
  const names: string[] = [];
  let current: Category | undefined = categories.find(c => c.id === id);
  while (current) {
    names.unshift(current.name);
    current = current.parentId ? categories.find(c => c.id === current!.parentId) : undefined;
  }
  return names.join(' / ');
}

export default function CategoryTreeSelect({
  categories,
  value,
  onChange,
  disabledIds = [],
  disabled = false,
  placeholder = '-- Không có (Danh mục gốc) --',
}: CategoryTreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const disabledSet = useMemo(() => new Set(disabledIds), [disabledIds]);
  const rootCategories = useMemo(() => categories.filter(c => c.parentId === null), [categories]);

  const reposition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  };

  const handleOpen = () => {
    if (disabled) return;
    reposition();
    // Mở sẵn nhánh dẫn tới lựa chọn hiện tại để người dùng thấy ngay ngữ cảnh
    if (value) {
      setExpanded(prev => {
        const next = { ...prev };
        getAncestorIds(categories, value).forEach(id => { next[id] = true; });
        return next;
      });
    }
    setSearch('');
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Khi đang gõ tìm kiếm: xác định các node khớp + toàn bộ tổ tiên của chúng (để auto-expand)
  const searchLower = search.trim().toLowerCase();
  const matchedIds = useMemo(() => {
    if (!searchLower) return null;
    const matched = new Set<string>();
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(searchLower) || cat.code.toLowerCase().includes(searchLower)) {
        matched.add(cat.id);
        getAncestorIds(categories, cat.id).forEach(id => matched.add(id));
      }
    });
    return matched;
  }, [searchLower, categories]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (id: string | null) => {
    onChange(id);
    setIsOpen(false);
  };

  const renderNode = (category: Category, level: number): React.ReactNode => {
    if (matchedIds && !matchedIds.has(category.id)) return null;

    const children = categories.filter(c => c.parentId === category.id);
    const hasChildren = children.length > 0;
    const isExpanded = searchLower ? true : !!expanded[category.id];
    const isSelected = value === category.id;
    const isDisabled = disabledSet.has(category.id);

    return (
      <div key={category.id}>
        <div
          onClick={() => !isDisabled && handleSelect(category.id)}
          title={isDisabled ? 'Không thể chọn chính danh mục này hoặc danh mục con của nó làm danh mục cha' : undefined}
          className={`flex items-center gap-1 py-1.5 px-2 rounded-lg transition-colors ${
            isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'
          } ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(category.id, e)}
                className="p-0.5 rounded hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600 font-normal border-none bg-transparent flex items-center justify-center cursor-pointer"
              >
                {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            )}
          </div>

          <span className={isSelected ? 'text-blue-500' : 'text-slate-400'}>
            {isDisabled ? <Ban size={14} /> : <Folder size={14} />}
          </span>

          <span className="text-xs truncate flex-1 ml-1">{category.name}</span>
          <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{category.code}</span>
          {isSelected && <Check size={13} className="text-blue-600 ml-1 flex-shrink-0" />}
        </div>

        {hasChildren && isExpanded && (
          <div>{children.map(child => renderNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  const selectedLabel = value ? getPathLabel(categories, value) : '';

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        <span className={`truncate text-left ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {value ? selectedLabel : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: position.top, left: position.left, width: position.width, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc mã danh mục..."
                className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            <div
              onClick={() => handleSelect(null)}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg cursor-pointer text-xs mb-0.5 ${
                value === null ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {placeholder}
              {value === null && <Check size={13} className="text-blue-600 ml-auto flex-shrink-0" />}
            </div>

            {rootCategories.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">Chưa có danh mục nào.</div>
            ) : matchedIds && matchedIds.size === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">Không tìm thấy danh mục phù hợp.</div>
            ) : (
              rootCategories.map(cat => renderNode(cat, 0))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
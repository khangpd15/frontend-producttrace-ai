import { Search } from 'lucide-react';

export function TopAppBar({ title, showBack = false, onBackClick }: { title: string; showBack?: boolean; onBackClick?: () => void }) {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-4 z-40 justify-between">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Tìm kiếm..." className="pl-8 pr-4 py-1 bg-slate-100 rounded-full text-sm outline-none w-32 focus:w-48 transition-all" />
        </div>
      </div>
    </header>
  );
}

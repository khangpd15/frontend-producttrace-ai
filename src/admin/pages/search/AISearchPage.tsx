import React, { useState } from 'react';
import { Search, Sparkles, Filter, Database, Tag, MapPin, Award, ArrowUpRight, HelpCircle } from 'lucide-react';
import { useHybridSearch } from '../../../features/search/hooks/useSearch';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { parseApiError } from '../../../api/axios';
import type { SearchResultItem } from '../../../features/search/api/search.api';

export default function AISearchPage() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  // Filters state
  const [category, setCategory] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [province, setProvince] = useState('');

  const searchMutation = useHybridSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    searchMutation.mutate({
      query: query.trim(),
        ...(category ? { category } : {}),
        ...(manufacturer ? { manufacturer } : {}),
        ...(province ? { province } : {}),
      limit: 20,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    if (score >= 0.5) return 'bg-blue-50 text-blue-700 border-blue-200/60';
    return 'bg-slate-50 text-slate-600 border-slate-200/60';
  };

  const highlightKeyword = (text: string, searchQuery: string) => {
    if (!text) return '';
    if (!searchQuery || !searchQuery.trim()) return text;
    
    // Split the query into terms, filtering out short stop-words
    const terms = searchQuery.trim().split(/\s+/)
      .map(term => term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .filter(term => term.length > 1);

    if (terms.length === 0) return text;
    
    try {
      const regex = new RegExp(`(${terms.join('|')})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, index) => 
            regex.test(part) ? (
              <mark key={index} className="bg-yellow-100/90 text-slate-900 font-bold px-0.5 rounded-sm">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    } catch (err) {
      return text;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-2xl border border-indigo-950 text-white relative overflow-hidden shadow-lg">
        <div className="space-y-3.5 z-10 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} /> AI-Powered Search
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Tìm kiếm lai (Hybrid Semantic Search)</h1>
          <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed font-medium">
            Kết hợp tìm kiếm từ khóa truyền thống và tìm kiếm ý nghĩa (Vector Embeddings 1024-D) xếp hạng bằng thuật toán RRF. Cho phép tìm kiếm sản phẩm theo mô tả ngữ nghĩa và vị trí địa lý.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-[0.08] flex items-center justify-center pointer-events-none pr-12">
          <Sparkles size={180} className="text-indigo-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filters Panel */}
        {showFilters && (
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Filter size={14} className="text-indigo-500" /> Bộ lọc nâng cao
              </h3>
              <button
                onClick={() => {
                  setCategory('');
                  setManufacturer('');
                  setProvince('');
                }}
                className="text-[10px] text-slate-400 hover:text-indigo-500 font-bold bg-transparent border-none cursor-pointer transition-colors"
              >
                Đặt lại
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Danh mục</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl text-xs py-2.5 pl-3 pr-8 cursor-pointer focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                >
                  <option value="">Tất cả danh mục</option>
                  <option value="Thiết bị gia dụng">Thiết bị gia dụng</option>
                  <option value="Năng lượng mặt trời">Năng lượng mặt trời</option>
                  <option value="Sơn & Chất phủ">Sơn & Chất phủ</option>
                  <option value="Thực phẩm chức năng">Thực phẩm chức năng</option>
                </select>
              </div>

              {/* Manufacturer */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nhà sản xuất</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={e => setManufacturer(e.target.value)}
                  placeholder="Kangaroo, JA Solar..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl text-xs px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Province */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tỉnh thành</label>
                <input
                  type="text"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  placeholder="Hà Nội, TP.HCM..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl text-xs px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Search Area */}
        <div className={showFilters ? 'lg:col-span-3 space-y-6' : 'lg:col-span-4 space-y-6'}>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Nhập ý tưởng tìm kiếm (ví dụ: máy lọc nước Kangaroo tốt cho gia đình)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 rounded-xl text-xs focus:outline-none transition-all duration-200"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer shadow-3xs transition-colors"
              >
                <Filter size={14} /> Bộ lọc
              </Button>
              <Button
                type="submit"
                disabled={searchMutation.isPending}
                className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all duration-200"
              >
                {searchMutation.isPending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Tìm với AI
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {searchMutation.isError && (
            <div className="bg-red-50 border border-red-200/80 text-red-800 p-4.5 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-3xs">
              <HelpCircle className="text-red-500 flex-shrink-0" size={18} />
              <span>Lỗi khi gọi Nest AI service: <strong>{parseApiError(searchMutation.error)}</strong></span>
            </div>
          )}

          {/* Results Area */}
          {searchMutation.isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-xs animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-5 bg-slate-100 rounded w-16" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : searchMutation.data ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Tìm thấy <strong>{searchMutation.data.results.length}</strong> kết quả phù hợp nhất</span>
              </div>

              {searchMutation.data.results.length === 0 ? (
                <div className="bg-white p-16 text-center border border-slate-200/80 rounded-2xl shadow-xs">
                  <Database size={40} className="mx-auto text-slate-300 mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">Không tìm thấy kết quả nào</h4>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto font-medium">
                    Thử tìm kiếm với từ khóa khác hoặc điều chỉnh các bộ lọc bên trái.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchMutation.data.results.map((item: SearchResultItem) => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all duration-300 flex gap-5 group">
                      {item.thumbnail_url && (
                        <img src={item.thumbnail_url} alt={item.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0 border border-slate-100 shadow-2xs" />
                      )}
                      <div className="flex-1 space-y-2.5 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                              <span className="truncate">{highlightKeyword(item.name, query)}</span>
                              <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                            </h3>
                            <div className="flex flex-wrap gap-2.5 mt-2">
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200/50">
                                <Tag size={10} className="text-slate-400" /> {item.category}
                              </span>
                              {item.manufacturer && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200/50">
                                  <Award size={10} className="text-slate-400" /> {item.manufacturer}
                                </span>
                              )}
                              {item.province && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200/50">
                                  <MapPin size={10} className="text-slate-400" /> {item.province}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Relevance score */}
                          {item.score !== undefined && (
                            <span className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-bold border flex-shrink-0 tracking-tight shadow-3xs ${getScoreColor(item.score)}`}>
                              Relevance: {Math.round(item.score * 100)}%
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{highlightKeyword(item.description, query)}</p>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap pt-1">
                            {item.tags.map(t => (
                              <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-bold border border-slate-200/20">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-16 text-center text-slate-400 shadow-3xs">
              <Sparkles size={36} className="mx-auto text-indigo-400 opacity-60 mb-3 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-700">Khám phá kho sản phẩm của bạn</h4>
              <p className="text-[10px] max-w-sm mx-auto mt-1 leading-relaxed font-semibold text-slate-400">
                Nhập câu hỏi hoặc mô tả tự nhiên về sản phẩm bạn muốn tìm kiếm, AI sẽ giúp bạn tìm dựa trên ý nghĩa thực sự của câu từ.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


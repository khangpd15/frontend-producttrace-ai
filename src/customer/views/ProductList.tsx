import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Tag,
  Search as SearchIcon,
  ArrowLeft,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHybridSearch } from '../../features/search/hooks/useSearch';
import { productApi } from '../../features/products/api/product.api';
import { parseApiError } from '../../api/axios';

interface DisplayProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  manufacturer?: string;
  province?: string;
  score?: number;
}

export function ProductList({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');

  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchMutation = useHybridSearch();

  // Categories list for chips / select filter
  const categories = [
    { label: 'Gia dụng', value: 'Gia dụng' },
    { label: 'Năng lượng', value: 'Năng lượng' },
    { label: 'Điện thoại', value: 'Điện thoại' },
    { label: 'Tivi', value: 'Tivi' },
    { label: 'Dược phẩm', value: 'Dược phẩm' },
  ];

  // Perform search helper
  const performAISearch = (searchVal: string) => {
    if (!searchVal.trim()) return;
    setErrorMsg(null);

    const filters: Record<string, string> = {};
    if (categoryFilter) filters.category = categoryFilter;
    if (manufacturerFilter.trim()) filters.manufacturer = manufacturerFilter.trim();
    if (provinceFilter.trim()) filters.province = provinceFilter.trim();

    searchMutation.mutate({
      query: searchVal.trim(),
      category: categoryFilter || undefined,
      manufacturer: manufacturerFilter.trim() || undefined,
      province: provinceFilter.trim() || undefined,
      limit: 20
    });
  };

  // Handle default list loading (when no search query is active)
  const loadDefaultProducts = async () => {
    setIsLoadingDefault(true);
    setErrorMsg(null);
    try {
      const { data } = await productApi.getAll({ page: 1, limit: 12, status: 'ACTIVE' });
      const items = data.data.items || [];
      const mapped: DisplayProduct[] = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category || 'Sản phẩm',
        description: item.description || '',
        imageUrl: item.thumbnail_url || '',
      }));
      setDisplayProducts(mapped);
    } catch (err: any) {
      setErrorMsg(parseApiError(err));
    } finally {
      setIsLoadingDefault(false);
    }
  };

  // Effect: sync with URL params or load defaults
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performAISearch(initialQuery);
    } else {
      loadDefaultProducts();
    }
  }, [initialQuery]);

  // Effect: sync search results from mutation
  useEffect(() => {
    if (searchMutation.data) {
      const results = searchMutation.data.results || [];
      const mapped: DisplayProduct[] = results.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category || 'Sản phẩm',
        description: item.description || '',
        imageUrl: item.thumbnail_url || '',
        manufacturer: item.manufacturer,
        province: item.province,
        score: item.score,
      }));
      setDisplayProducts(mapped);
    }
  }, [searchMutation.data]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
      loadDefaultProducts();
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchParams({});
    loadDefaultProducts();
  };

  const isSearching = searchMutation.isPending || isLoadingDefault;

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header section */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-650"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-bold text-slate-800 flex-1">Tìm kiếm sản phẩm</h1>
        </div>

        {/* Search Input Bar */}
        <div className="px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Nhập tên sản phẩm, thương hiệu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 border rounded-xl flex items-center justify-center transition-colors ${showFilters || categoryFilter || manufacturerFilter || provinceFilter
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-650'
                }`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </form>

          {/* Collapsible Filter Bar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 pt-3 border-t border-slate-100 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Danh mục</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nhà sản xuất</label>
                    <input
                      type="text"
                      placeholder="vd: Kangaroo"
                      value={manufacturerFilter}
                      onChange={(e) => setManufacturerFilter(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Khu vực / Tỉnh thành</label>
                    <input
                      type="text"
                      placeholder="vd: Hà Nội"
                      value={provinceFilter}
                      onChange={(e) => setProvinceFilter(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter('');
                        setManufacturerFilter('');
                        setProvinceFilter('');
                      }}
                      className="flex-1 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                    >
                      Xóa lọc
                    </button>
                    <button
                      type="button"
                      onClick={() => performAISearch(query)}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results Header */}
      <div className="p-4 flex items-center justify-between">
        {initialQuery ? (
          <div className="flex items-center gap-1.5 text-blue-600">
            <Sparkles size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Kết quả tìm kiếm AI</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-550 uppercase tracking-wider">Sản phẩm nổi bật</span>
        )}
        <span className="text-xs font-medium text-slate-500">
          {displayProducts.length} kết quả
        </span>
      </div>

      {/* Main Content Area */}
      <div className="px-4">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start gap-3 mb-4">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="text-blue-600 animate-spin" size={32} />
            <p className="text-sm text-slate-500 font-medium">
              {initialQuery ? 'AI đang phân tích và tìm kiếm sản phẩm...' : 'Đang tải danh sách sản phẩm...'}
            </p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-150 rounded-2xl p-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <SearchIcon size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy kết quả nào</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Hãy thử tìm kiếm với từ khóa khác hoặc xóa bớt các bộ lọc đang áp dụng.
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 gap-3">
            {displayProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/customer/product?id=${p.id}`)}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col cursor-pointer relative overflow-hidden transition-all"
              >
                {/* AI Score Badge if available */}
                {p.score !== undefined && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-0.5 shadow-sm">
                    <Sparkles size={8} />
                    <span>AI: {Math.round(p.score * 100)}%</span>
                  </div>
                )}

                {/* Product Thumbnail */}
                <div className="w-full aspect-square bg-slate-50 rounded-xl mb-2.5 flex items-center justify-center text-slate-350 overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ''; // Clear source to fallback to tag icon
                      }}
                    />
                  ) : (
                    <Tag size={32} />
                  )}
                </div>

                <span className="text-[10px] text-blue-600 mb-1 font-semibold uppercase tracking-wider">
                  {p.category}
                </span>

                <h3 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 leading-snug min-h-[32px]">
                  {p.name}
                </h3>

                {p.manufacturer && (
                  <p className="text-[10px] text-slate-500 mb-2">
                    Hãng: <span className="font-semibold text-slate-700">{p.manufacturer}</span>
                  </p>
                )}

                <div className="text-[10px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {p.description}
                </div>

                <div className="text-xs font-bold text-blue-600 mt-auto border-t border-slate-50 pt-2 flex items-center justify-between">
                  <span>Chi tiết</span>
                  <span className="text-slate-350">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;

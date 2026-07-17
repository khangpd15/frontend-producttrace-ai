import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, AlertCircle, MapPin, Package, RefreshCw, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useBatchProducts } from '../../../features/batch/hooks/useBatchProducts';
import { useBatchDetail } from '../../../features/batch/hooks/useBatchDetail';

const STATUS_CONFIG: Record<string, { bg: string; dot: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang hoạt động' },
  EXPIRED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hết hạn sử dụng' },
  RECALLED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Đã thu hồi' },
  BLOCKED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400', label: 'Bị khóa' },
  DRAFT: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', label: 'Nháp' },
  SOLD: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Đã bán' },
  IN_STOCK: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Tồn kho' },
  IN_TRANSIT: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', label: 'Đang giao' },
  AT_DEALER: { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500', label: 'Tại đại lý' },
  REGISTERED: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đã đăng ký' },
  WARRANTY_ACTIVE: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'Đang bảo hành' },
  RETURNED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Trả hàng' },
  LOST: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Thất lạc' },
  DAMAGED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hư hỏng' },
};

function renderStatusBadge(status: string) {
  const c = STATUS_CONFIG[status.toUpperCase()] ?? {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    label: status
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function formatDateTime(val: string | null | undefined): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('vi-VN');
  } catch {
    return val;
  }
}

export default function BatchProductsPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [searchParams] = useSearchParams();
  const batchCode = searchParams.get('code');
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { detail, isLoading: isLoadingDetail } = useBatchDetail(batchCode);
  const { items, pagination, isLoading, error, refetch } = useBatchProducts(batchId, {
    page,
    limit: 10,
    keyword: searchKeyword || undefined,
    status: filterStatus || undefined,
  });

  const handleBack = () => {
    navigate('/batches');
  };

  const handleTraceClick = (itemCode: string) => {
    navigate(`/batches/${batchId}/trace?code=${batchCode}&itemCode=${itemCode}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header / Breadcrumb */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold w-fit transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại danh sách lô hàng
        </button>

        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Danh sách sản phẩm trong lô
              {batchCode && (
                <span className="font-mono font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg text-sm">
                  {batchCode}
                </span>
              )}
            </h1>
            {detail && (
              <p className="text-sm text-slate-500 mt-1">
                Sản phẩm: <span className="font-semibold text-slate-700">{detail.product.product_name}</span>
                {detail.variant.name && (
                  <>
                    {' '}— Biến thể: <span className="font-semibold text-slate-700">{detail.variant.name} ({detail.variant.sku})</span>
                  </>
                )}
              </p>
            )}
          </div>
          <Button
            onClick={refetch}
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {error && !isLoading ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải danh sách sản phẩm</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">{error}</p>
          <Button onClick={refetch} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            Thử lại
          </Button>
        </Card>
      ) : (
        <>
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-70">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={e => { setSearchKeyword(e.target.value); setPage(1); }}
                  placeholder="Tìm theo mã sản phẩm hoặc số serial..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Trạng thái:</span>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="SOLD">Đã bán</option>
                  <option value="EXPIRED">Hết hạn</option>
                  <option value="RECALLED">Thu hồi</option>
                  <option value="BLOCKED">Bị khóa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="space-y-4 p-6 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Package size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">
                  Không có sản phẩm nào khớp với điều kiện tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[25%]">Mã Sản Phẩm</th>
                      <th className="p-3.5 font-bold tracking-wider w-[25%]">Số Serial (S/N)</th>
                      <th className="p-3.5 font-bold tracking-wider w-[20%]">Vị trí hiện tại</th>
                      <th className="p-3.5 font-bold tracking-wider w-[15%] text-center">Trạng thái</th>
                      <th className="p-3.5 font-bold tracking-wider w-[15%] text-center">Ngày tạo</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[12%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(item => (
                      <tr key={item.itemId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-800 truncate">
                          {item.itemCode}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 truncate">
                          {item.serialNumber}
                        </td>
                        <td className="p-3.5 text-slate-600 truncate">
                          {item.currentLocation ? (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-slate-400 shrink-0" />
                              {item.currentLocation.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal italic">Chưa xác định</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {renderStatusBadge(item.status)}
                        </td>
                        <td className="p-3.5 text-center text-slate-500 text-xs">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => handleTraceClick(item.itemCode)}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer border-none bg-transparent"
                            title="Xem truy vết nguồn gốc sản phẩm"
                          >
                            <Activity size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Hiển thị {items.length} / {pagination.totalRecords.toLocaleString()} sản phẩm
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 cursor-pointer bg-white"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-xs font-semibold text-slate-700">
                    {page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 cursor-pointer bg-white"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

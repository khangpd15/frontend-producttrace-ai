import React, { useState } from 'react';
import { 
  Search, Plus, Download, ChevronLeft, ChevronRight, 
  Filter, Eye, Package, Layers, Trash2, AlertCircle, Inbox, X
} from 'lucide-react';
import { useProductList, useDeleteProduct } from '../../../features/products/hooks/useProducts';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ProductList: React.FC<{ onNavigate: (tabId: string, id?: string) => void }> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error, refetch } = useProductList({
    page,
    limit,
    search: searchTerm || undefined,
  });

  const deleteMutation = useDeleteProduct();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Xóa sản phẩm thành công!');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Xóa sản phẩm thất bại');
      }
    }
  };

  const products = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-150 text-green-700 border-green-200',
      DRAFT: 'bg-yellow-150 text-yellow-700 border-yellow-250',
      DISCONTINUED: 'bg-red-150 text-red-700 border-red-200'
    };

    const labels: Record<string, string> = {
      ACTIVE: 'Đang kinh doanh',
      DRAFT: 'Bản nháp',
      DISCONTINUED: 'Ngừng kinh doanh'
    };

    return (
      <span className={`inline-flex items-center justify-center min-w-[120px] h-7 px-2.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-150 border-gray-200 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Danh sách sản phẩm</h1>
          <p className="text-sm text-gray-500">Danh sách sản phẩm đang được quản lý trong hệ thống ProductTrace-AI.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('create-product')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
            <Plus className="w-4 h-4" /> Tạo sản phẩm
          </button>
        </div>
      </div>

      {error ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu sản phẩm</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            {(error as any)?.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách sản phẩm.'}
          </p>
          <Button onClick={() => refetch()} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 h-96 animate-pulse"></div>
      ) : (
        <>
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên sản phẩm..." 
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
              )}
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-355 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Hệ thống chưa đăng ký sản phẩm nào phù hợp.</p>
                <Button onClick={() => onNavigate('create-product')} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Tạo sản phẩm</Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm table-fixed border-collapse">
                    <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-20 p-4">Ảnh</th>
                        <th className="w-[30%] p-4">Tên sản phẩm</th>
                        <th className="w-[20%] p-4">Danh mục</th>
                        <th className="w-28 p-4 text-center">Biến thể</th>
                        <th className="w-28 p-4 text-center">Lô hàng</th>
                        <th className="w-40 p-4 text-center">Trạng thái</th>
                        <th className="w-36 p-4 text-center">Ngày tạo</th>
                        <th className="w-32 p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(p => (
                        <tr
                          key={p.id}
                          onClick={() => onNavigate('product-detail', p.id)}
                          className="h-20 hover:bg-blue-50/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4" onClick={e => e.stopPropagation()}>
                            <img 
                              src={p.thumbnail_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150'} 
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg mx-auto border border-slate-100 shadow-xs" 
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-gray-900 line-clamp-2 transition-colors">
                              {p.name}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-600 line-clamp-2">
                              {p.category || 'N/A'}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center justify-center gap-1 text-gray-650 font-medium">
                              <Layers className="w-4 h-4 text-gray-400" />
                              <span>{p.variants_count ?? 0}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center justify-center gap-1 text-gray-650 font-medium">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>{p.batches_count ?? 0}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="p-4 text-center text-gray-500">
                            {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end items-center gap-1">
                              <button
                                onClick={() => onNavigate('product-detail', p.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-blue-600 cursor-pointer border-none bg-transparent"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-650 cursor-pointer border-none bg-transparent"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-550 bg-white">
                    <span>Hiển thị trang {page} / {totalPages} (Tổng số {total} sản phẩm)</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 cursor-pointer hover:bg-slate-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 cursor-pointer hover:bg-slate-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;

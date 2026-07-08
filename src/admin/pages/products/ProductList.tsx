import React, { useState } from 'react';
import { 
  Search, Plus, Download, ChevronLeft, ChevronRight, 
  Filter, MoreHorizontal, Eye, Edit2, Package, Layers, Trash2
} from 'lucide-react';

import {
  AdminProductListStatus as Status,
  AdminProductListProduct as Product
} from '@shared/types/domain';

const ProductList: React.FC<{ onNavigate: (tabId: string, id?: string) => void }> = ({ onNavigate }) => {
  const [products] = useState<Product[]>([
    { id: '1', name: 'Máy lọc nước RO Kangaroo', category: 'Thiết bị gia dụng', variants: 3, batches: 12, status: 'ACTIVE', date: '24/06/2026' },
    { id: '2', name: 'Tấm pin năng lượng mặt trời JA Solar', category: 'Năng lượng', variants: 2, batches: 8, status: 'ACTIVE', date: '20/06/2026' },
    { id: '3', name: 'Sơn chống thấm ngoại thất Spec', category: 'Vật liệu xây dựng', variants: 5, batches: 5, status: 'DRAFT', date: '15/06/2026' },
    { id: '4', name: 'Thực phẩm chức năng Omega-3', category: 'Dược phẩm', variants: 1, batches: 3, status: 'DISCONTINUED', date: '10/06/2026' },
  ]);

  const StatusBadge = ({ status }: { status: Status }) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700',
      DRAFT: 'bg-yellow-100 text-yellow-700',
      DISCONTINUED: 'bg-red-100 text-red-700'
    };

    const labels = {
      ACTIVE: 'Đang kinh doanh',
      DRAFT: 'Bản nháp',
      DISCONTINUED: 'Ngừng kinh doanh'
    };

    return (
      <span
        className={`
          inline-flex
          items-center
          justify-center
          min-w-[140px]
          h-8
          px-3
          rounded-full
          text-xs
          font-semibold
          whitespace-nowrap
          ${styles[status]}
        `}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product List</h1>
          <p className="text-sm text-gray-500">Danh sách sản phẩm đang được quản lý trong hệ thống ProductTrace-AI.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white flex items-center gap-2 cursor-pointer">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => onNavigate('create-product')} className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Create Product
          </button>
        </div>
      </div>

      {/* Product Overview */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Tổng sản phẩm', value: '1,248' },
          { label: 'Đang kinh doanh', value: '1,120' },
          { label: 'Bản nháp', value: '50' },
          { label: 'Ngừng kinh doanh', value: '128' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Tìm theo tên sản phẩm..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-pointer">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm table-fixed border-collapse">
          <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-20 p-4">Thumbnail</th>
              <th className="w-[24%] p-4">Product Name</th>
              <th className="w-[18%] p-4">Category</th>
              <th className="w-28 p-4 text-center">Variants</th>
              <th className="w-28 p-4 text-center">Batches</th>
              <th className="w-40 p-4 text-center">Status</th>
              <th className="w-36 p-4 text-center">Created Date</th>
              <th className="w-32 p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr
                key={p.id}
                onClick={() => onNavigate('product-detail', p.id)}
                className="
                  h-20
                  hover:bg-blue-50/40
                  transition-colors
                  cursor-pointer
                "
              >
                <td className="p-4"><div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto"></div></td>
                <td className="p-4">
                  <div className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-gray-600 line-clamp-2">
                    {p.category}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center justify-center gap-1 text-gray-600">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span>{p.variants}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center justify-center gap-1 text-gray-600">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>{p.batches}</span>
                  </div>
                </td>
                <td className="p-4 text-center"><StatusBadge status={p.status} /></td>
                <td className="p-4 text-center text-gray-500">{p.date}</td>
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
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${p.name}?`)) {
                           alert(`Đã xóa sản phẩm ${p.name}`);
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-600 cursor-pointer border-none bg-transparent"
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
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <span>Showing 1-4 of 1,248</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg cursor-pointer">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg cursor-pointer">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;

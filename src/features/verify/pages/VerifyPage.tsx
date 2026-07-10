import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicApi, VerifyQRResponse } from '../../../api/public.api';
import { ShieldCheck, ShieldAlert, Calendar, MapPin, Truck, Factory, Package, Barcode, CheckCircle, Info } from 'lucide-react';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const itemCode = searchParams.get('item_code');
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerifyQRResponse | null>(null);

  useEffect(() => {
    if (!itemCode || !token) {
      setError('Mã QR không hợp lệ hoặc thiếu thông tin xác thực (item_code / token).');
      setLoading(false);
      return;
    }

    setLoading(true);
    publicApi
      .verifyQR(itemCode, token)
      .then((res) => {
        if (res.data && res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data?.message || 'Không thể xác thực sản phẩm này.');
        }
      })
      .catch((err) => {
        console.error(err);
        const msg = err.response?.data?.message || 'Có lỗi xảy ra khi kết nối tới máy chủ.';
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [itemCode, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 bg-emerald-500/20 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-6 text-slate-400 text-sm font-medium animate-pulse">Đang truy xuất thông tin nguồn gốc...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-red-500/30 shadow-2xl text-center">
          <div className="inline-flex p-4 bg-red-500/10 rounded-full text-red-500 mb-6">
            <ShieldAlert size={48} className="animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Cảnh báo Xác thực</h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">{error}</p>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-left text-xs text-red-300 mb-6">
            <div className="flex gap-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>Mã QR này có thể không phải do hệ thống chính hãng phát hành hoặc đã bị giả mạo. Vui lòng liên hệ với nhà cung cấp để biết thêm chi tiết.</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-red-600/20"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const formattedScanDate = new Date(data.scanned_at).toLocaleString('vi-VN');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 py-10 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Banner xác thực thành công */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="inline-flex p-4 bg-emerald-500/20 rounded-full text-emerald-400 mb-4 animate-pulse">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-400 tracking-tight">Sản Phẩm Chính Hãng</h1>
          <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-md mx-auto">
            Sản phẩm đã được kiểm chứng nguồn gốc xuất xứ thông qua hệ thống ProductTrace-AI.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
            <CheckCircle size={14} />
            Đã xác thực vào {formattedScanDate}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-700/50 pb-3 flex items-center gap-2">
            <Package size={20} className="text-blue-400" />
            Thông Tin Sản Phẩm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Tên sản phẩm</p>
              <p className="text-slate-100 font-semibold text-base mt-1">{data.product.product_name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Phiên bản / Variant</p>
              <p className="text-slate-100 font-semibold text-base mt-1">{data.product.variant_name}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Mã sản phẩm (SKU)</p>
              <p className="font-mono text-slate-300 mt-1 flex items-center gap-1">
                <Barcode size={14} className="text-slate-500" />
                {data.product.variant_sku}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Trạng thái hiện tại</p>
              <p className="mt-1">
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold uppercase">
                  {data.item_status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin lô hàng */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-700/50 pb-3 flex items-center gap-2">
            <Factory size={20} className="text-emerald-400" />
            Thông Tin Lô Sản Xuất
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Mã lô hàng (Batch Code)</p>
              <p className="font-mono text-slate-100 font-bold mt-1 text-base">{data.batch.batch_code}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Nhà sản xuất</p>
              <p className="text-slate-100 mt-1">{data.batch.manufacturer_name || 'Không xác định'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} className="text-slate-500" /> Ngày sản xuất
              </p>
              <p className="text-slate-100 mt-1">
                {data.batch.manufacture_date
                  ? new Date(data.batch.manufacture_date).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} className="text-slate-500" /> Hạn sử dụng
              </p>
              <p className="text-slate-100 mt-1">
                {data.batch.expiry_date
                  ? new Date(data.batch.expiry_date).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} className="text-slate-500" /> Xuất xứ
              </p>
              <p className="text-slate-100 mt-1">{data.batch.origin_country || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} className="text-slate-500" /> Nơi sản xuất
              </p>
              <p className="text-slate-100 mt-1">{data.batch.production_place || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                <Truck size={12} className="text-slate-500" /> Nhà cung cấp
              </p>
              <p className="text-slate-100 mt-1">{data.batch.supplier_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Trạng thái lô hàng</p>
              <p className="mt-1">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold uppercase">
                  {data.batch.batch_status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin đơn vị sản phẩm */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-700/50 pb-3 flex items-center gap-2">
            <Info size={20} className="text-purple-400" />
            Chi Tiết Sản Phẩm Đơn Lẻ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Mã định danh (Item Code)</p>
              <p className="font-mono text-slate-100 mt-1">{data.item_code}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Số Serial (Serial Number)</p>
              <p className="font-mono text-slate-100 mt-1">{data.serial_number || 'Chưa định danh'}</p>
            </div>
          </div>
        </div>

        {/* Footer của trang */}
        <div className="text-center text-xs text-slate-500 pt-4">
          <p>© 2026 ProductTrace-AI. Hệ thống minh bạch nguồn gốc sản phẩm.</p>
        </div>

      </div>
    </div>
  );
}

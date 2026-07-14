import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  XCircle, 
  Package, 
  MapPin, 
  Calendar, 
  Building2, 
  Globe, 
  Clock, 
  Tag, 
  ArrowRight,
  Loader2,
  Award
} from 'lucide-react';
import { traceApi } from '../api/trace.api';
import { VerifyQRResponse } from '../api/trace.types';

export default function VerifyProductPage() {
  const [searchParams] = useSearchParams();
  const itemCode = searchParams.get('item_code');
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerifyQRResponse | null>(null);

  useEffect(() => {
    async function verify() {
      if (!itemCode || !token) {
        setError('Thiếu thông tin mã sản phẩm (item_code) hoặc mã xác thực (token).');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await traceApi.verifyQR(itemCode, token);
        if (response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          setError(response.data.message || 'Xác thực không thành công.');
        }
      } catch (err: any) {
        console.error('Verify error:', err);
        const status = err.response?.status;
        if (status === 404) {
          setError('Không tìm thấy mã sản phẩm này trên hệ thống hoặc mã xác thực không chính xác.');
        } else {
          setError(err.response?.data?.message || err.message || 'Hệ thống xác thực đang gặp sự cố. Vui lòng thử lại sau.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [itemCode, token]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-850 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Đang kiểm tra tính xác thực sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-850 to-slate-905 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl mx-auto flex items-center justify-center text-red-500 border border-red-500/20">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Xác Thực Thất Bại</h1>
            <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          </div>
          <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-3">
            <Link 
              to="/login" 
              className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              Đăng nhập hệ thống
            </Link>
            <a 
              href="mailto:support@producttrace.vn" 
              className="py-2.5 bg-slate-700 hover:bg-slate-650 text-slate-200 rounded-xl font-medium text-sm transition-all border border-slate-600/30"
            >
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-10 px-4 md:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Banner Verification Status */}
        <div className="bg-slate-900/60 border border-emerald-500/30 backdrop-blur-xl rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500/70" />
          
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl mx-auto flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner animate-pulse">
            <ShieldCheck className="w-12 h-12" />
          </div>
          
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
              Authentic Product
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Sản Phẩm Chính Hãng</h1>
            <p className="text-slate-400 text-sm">
              Sản phẩm đã được xác thực nguồn gốc hợp lệ trên hệ thống ProductTrace-AI.
            </p>
          </div>

          <div className="pt-2 flex justify-center items-center gap-2 text-xs text-slate-500 bg-slate-950/40 py-2.5 px-4 rounded-2xl w-fit mx-auto border border-slate-800/60">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Đã kiểm tra vào: <strong className="text-slate-300 font-medium">{formatDateTime(data.scannedAt)}</strong></span>
          </div>
        </div>

        {/* Product Information Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Package className="w-5 h-5 text-blue-400" />
            Thông Tin Sản Phẩm
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tên sản phẩm</span>
              <p className="text-base font-bold text-white">{data.product.productName}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phiên bản (Variant)</span>
              <p className="text-base font-bold text-white">{data.product.variantName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mã sản phẩm (Item Code)</span>
              <p className="text-sm font-mono bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-850 w-fit text-blue-300 font-semibold">
                {data.itemCode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Số Serial (Serial Number)</span>
              <p className="text-sm font-mono bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-850 w-fit text-slate-300">
                {data.serialNumber || 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">SKU kỹ thuật</span>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Tag className="w-4 h-4 text-slate-500" />
                <span>{data.product.variantSKU}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Trạng thái lưu hành</span>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  data.itemStatus === 'SOLD' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                  data.itemStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {data.itemStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Batch details Card */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="w-5 h-5 text-emerald-400" />
            Thông Tin Lô Hàng & Xuất Xứ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mã lô hàng (Batch Code)</span>
              <p className="text-sm font-mono text-white bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-850 w-fit">
                {data.batch.batchCode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Quốc gia xuất xứ</span>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>{data.batch.originCountry}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nơi sản xuất</span>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{data.batch.productionPlace}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Trạng thái lô hàng</span>
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                  {data.batch.batchStatus}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Ngày sản xuất</span>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{formatDate(data.batch.manufactureDate)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Hạn sử dụng</span>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{formatDate(data.batch.expiryDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturing & Supply chain Details */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-md">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Nhà Sản Xuất & Đối Tác
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nhà sản xuất</span>
              <p className="text-base font-semibold text-slate-200">{data.batch.manufacturerName}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nhà cung ứng</span>
              <p className="text-base font-semibold text-slate-200">{data.batch.supplierName}</p>
            </div>
          </div>
        </div>

        {/* Additional actions / CTA */}
        <div className="bg-blue-600/10 border border-blue-500/20 backdrop-blur-xl rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-blue-500/5">
          <div className="space-y-1">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Bạn muốn theo dõi sâu hơn?
            </h3>
            <p className="text-xs text-slate-400">
              Đăng nhập tài khoản khách hàng để đăng ký sở hữu, yêu cầu bảo hành hoặc xem lịch sử truy vết đầy đủ.
            </p>
          </div>
          <Link 
            to={`/login?redirect=/customer/product?code=${encodeURIComponent(data.itemCode)}`}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer shrink-0"
          >
            Đăng nhập ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} ProductTrace-AI. Đã đăng ký bản quyền.
          </p>
        </div>

      </div>
    </div>
  );
}

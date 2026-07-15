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
  Award,
  User,
  List,
  FileText
} from 'lucide-react';
import { traceApi } from '../api/trace.api';
import { useAuthStore } from '../../auth/store/auth.store';
import { VerifyQRResponse } from '../api/trace.types';

export default function VerifyProductPage() {
  const [searchParams] = useSearchParams();
  const itemCode = searchParams.get('item_code');
  const token = searchParams.get('token');

  const { isAuthenticated } = useAuthStore();
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium animate-pulse">Đang kiểm tra tính xác thực sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl mx-auto flex items-center justify-center text-red-500 border border-red-100">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Xác Thực Thất Bại</h1>
            <p className="text-sm text-slate-550 leading-relaxed">{error}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
            <Link 
              to="/login" 
              className="py-2.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md"
            >
              Đăng nhập hệ thống
            </Link>
            <a 
              href="mailto:support@producttrace.vn" 
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-all border border-slate-200"
            >
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Title Top Bar */}
        <div className="flex justify-between items-center pb-2">
          <h1 className="text-2xl font-bold text-slate-800">Chi tiết sản phẩm</h1>
        </div>

        {/* Banner Verification Status */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
          
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-1">
            <span className="inline-block px-3 py-0.5 bg-emerald-100 border border-emerald-250 rounded-full text-emerald-800 font-semibold text-xs tracking-wider uppercase mb-1">
              Authentic Product
            </span>
            <h2 className="text-xl font-extrabold text-emerald-950 tracking-tight">Sản Phẩm Chính Hãng</h2>
            <p className="text-emerald-800/80 text-sm">
              Sản phẩm đã được xác thực nguồn gốc hợp lệ trên hệ thống ProductTrace-AI.
            </p>
          </div>

          <div className="pt-2 flex justify-center items-center gap-2 text-xs text-slate-500 bg-white/80 py-2 px-4 rounded-xl w-fit mx-auto border border-slate-200/60 shadow-xxs">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Đã kiểm tra vào: <strong className="text-slate-700 font-semibold">{formatDateTime(data.scannedAt)}</strong></span>
          </div>
        </div>

        {/* Product Header / Image Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
              {data.product.thumbnailUrl ? (
                <img 
                  src={data.product.thumbnailUrl} 
                  alt={data.product.productName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">{data.product.productName}</h2>
              <p className="text-sm text-slate-500 font-medium">{data.product.categoryName || 'Danh mục sản phẩm'}</p>
              <p className="text-xs text-slate-400 font-medium">{data.product.variantName}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              data.itemStatus === 'SOLD' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
              data.itemStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
              'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {data.itemStatus}
            </span>
            <span className="inline-block px-3 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-semibold tracking-wider">
              Authentic
            </span>
          </div>
        </div>

        {/* Technical Information Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-blue-500" />
            Thông Số Kỹ Thuật
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">SKU kỹ thuật</span>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>{data.product.variantSKU || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Mã Barcode</span>
              <p className="text-sm font-mono text-slate-700">
                {data.product.barcode || 'N/A'}
              </p>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Mô tả sản phẩm</span>
              <p className="text-sm text-slate-600 leading-relaxed">
                {data.product.description || 'Chưa có thông tin mô tả chi tiết sản phẩm.'}
              </p>
            </div>
          </div>
        </div>

        {/* Manufacturing Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-emerald-500" />
            Thông Tin Sản Xuất & Xuất Xứ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Nhà sản xuất</span>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{data.batch.manufacturerName || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Quốc gia xuất xứ</span>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>{data.batch.originCountry || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Nơi sản xuất</span>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{data.batch.productionPlace || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Mã lô hàng (Batch Code)</span>
              <p className="text-sm font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 w-fit">
                {data.batch.batchCode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Ngày sản xuất</span>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(data.batch.manufactureDate)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Hạn sử dụng</span>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(data.batch.expiryDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership & Warranty Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-indigo-500" />
            Sở Hữu & Bảo Hành
          </h2>

          <div className="space-y-6">
            {/* Owner Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Chủ sở hữu</span>
                <span className="text-base font-semibold text-slate-800">
                  {data.ownership ? data.ownership.ownerName : 'N/A'}
                </span>
                {data.ownership && (
                  <p className="text-xs text-slate-500">
                    Đăng ký ngày: {formatDate(data.ownership.registeredAt)} ({data.ownership.ownershipType})
                  </p>
                )}
              </div>
              {isAuthenticated && !data.ownership && (
                <Link
                  to={`/customer/ownership?code=${encodeURIComponent(data.itemCode)}`}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Đăng ký sở hữu
                </Link>
              )}
            </div>

            {/* Warranty Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Bảo hành</span>
                <span className="text-base font-semibold text-slate-800">
                  {data.warranty ? `${data.warranty.claimNumber} (${data.warranty.status})` : 'N/A'}
                </span>
                {data.warranty && (
                  <p className="text-xs text-slate-500">
                    Ghi nhận lúc: {formatDateTime(data.warranty.createdAt)}
                  </p>
                )}
              </div>
              {isAuthenticated && (
                <Link
                  to={`/customer/warranty?code=${encodeURIComponent(data.itemCode)}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200"
                >
                  Yêu cầu bảo hành
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Current Location Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-red-500" />
            Vị Trí Hiện Tại
          </h2>

          {data.location ? (
            <div className="space-y-2">
              <p className="text-base font-bold text-slate-900">{data.location.name}</p>
              <div className="text-sm text-slate-650 space-y-1">
                <p><span className="text-slate-400 font-medium">Loại địa điểm:</span> {data.location.type}</p>
                <p><span className="text-slate-400 font-medium">Địa chỉ:</span> {data.location.address}</p>
                <p><span className="text-slate-400 font-medium">Thành phố:</span> {data.location.city || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Sản phẩm chưa được cập nhật vị trí hiện tại.</p>
          )}
        </div>

        {/* Trace History Timeline */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <List className="w-5 h-5 text-indigo-550" />
            Lịch Sử Truy Vết
          </h2>

          <div className="space-y-6">
            {data.traceHistory && data.traceHistory.length > 0 ? (
              data.traceHistory.map((event, index) => (
                <div key={index} className="flex gap-4 relative">
                  {/* Timeline bar line connector */}
                  {index < data.traceHistory.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-slate-150" />
                  )}
                  {/* Event status circle */}
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center shrink-0 z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="space-y-1 pb-4">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-bold text-slate-800">{event.title}</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100">
                        {event.eventType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{event.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(event.occurredAt)}
                      </span>
                      {event.actorName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {event.actorName}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Chưa có thông tin sự kiện truy vết nào.</p>
            )}
          </div>
        </div>

        {/* Additional actions / CTA - only show when user is NOT logged in */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-bold text-blue-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Bạn muốn theo dõi sâu hơn?
              </h3>
              <p className="text-xs text-blue-800">
                Đăng nhập tài khoản khách hàng để đăng ký sở hữu, yêu cầu bảo hành hoặc xem lịch sử truy vết đầy đủ.
              </p>
            </div>
            <Link 
              to={`/login?redirect=/customer/product?code=${encodeURIComponent(data.itemCode)}`}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer shrink-0"
            >
              Đăng nhập ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} ProductTrace-AI. Đã đăng ký bản quyền.
          </p>
        </div>

      </div>
    </div>
  );
}

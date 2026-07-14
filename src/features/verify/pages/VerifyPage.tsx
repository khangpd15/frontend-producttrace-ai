import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { publicApi, VerifyQRResponse } from '../../../api/public.api';
import { parseApiError } from '../../../api/axios';
import { useAuthStore } from '../../auth/store/auth.store';
import {
  ShieldCheck, ShieldAlert, Calendar, MapPin, Truck, Factory, Package,
  Barcode, CheckCircle, Info, ClipboardList, ShieldPlus, LogIn,
  User, Clock, Activity, Tag, ArrowLeft,
} from 'lucide-react';

function fmtDate(val: string | null | undefined): string {
  if (!val) return 'N/A';
  try { return new Date(val).toLocaleDateString('vi-VN'); } catch { return val; }
}
function fmtDateTime(val: string | null | undefined): string {
  if (!val) return 'N/A';
  try { return new Date(val).toLocaleString('vi-VN'); } catch { return val; }
}

function SectionCard({ icon, title, iconColor, children }: {
  icon: React.ReactNode;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <span className={iconColor ?? 'text-blue-500'}>{icon}</span>
        <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value || '—'}</span>
    </div>
  );
}

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const itemCode = searchParams.get('item_code');
  const token = searchParams.get('token');

  const { isAuthenticated, user } = useAuthStore();
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerifyQRResponse | null>(null);

  useEffect(() => {
    if (!itemCode || !token) {
      setError('Mã QR không hợp lệ hoặc thiếu thông tin xác thực.');
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
        setError(parseApiError(err));
      })
      .finally(() => setLoading(false));
  }, [itemCode, token]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">Đang truy xuất thông tin nguồn gốc...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-red-100 shadow-sm p-6 text-center space-y-4">
          <div className="inline-flex p-3 bg-red-50 rounded-full text-red-500">
            <ShieldAlert size={36} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Xác thực thất bại</h1>
          <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-left text-xs text-red-600 flex gap-2 items-start">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>Mã QR này có thể không phải do hệ thống chính hãng phát hành hoặc đã hết hạn. Vui lòng liên hệ nhà cung cấp.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4 gap-3 shadow-xs">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="font-semibold text-slate-800 text-sm">Xác thực sản phẩm</span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
          Chính hãng
        </span>
      </header>

      <div className="px-4 pt-5 space-y-4">

        {/* ── Verified banner ── */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">ProductTrace-AI</p>
              <h1 className="text-xl font-extrabold tracking-tight mt-0.5">Sản Phẩm Chính Hãng</h1>
              <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
                <CheckCircle size={11} />
                Đã xác thực lúc {fmtDateTime(data.scannedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Product info ── */}
        <SectionCard icon={<Package size={16} />} title="Thông tin sản phẩm" iconColor="text-blue-500">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InfoRow label="Tên sản phẩm" value={<span className="text-base font-bold text-slate-900">{data.product.productName}</span>} />
            </div>
            <InfoRow label="Phiên bản" value={data.product.variantName} />
            <InfoRow label="SKU" value={
              <span className="font-mono flex items-center gap-1">
                <Barcode size={12} className="text-slate-400" />{data.product.variantSku}
              </span>
            } />
            <InfoRow label="Trạng thái" value={
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-semibold uppercase">
                {data.itemStatus}
              </span>
            } />
            {data.product.categoryName && (
              <InfoRow label="Danh mục" value={
                <span className="flex items-center gap-1"><Tag size={11} className="text-slate-400" />{data.product.categoryName}</span>
              } />
            )}
            {data.product.barcode && (
              <InfoRow label="Barcode" value={<span className="font-mono">{data.product.barcode}</span>} />
            )}
            {data.product.description && (
              <div className="col-span-2 pt-1 border-t border-slate-50">
                <InfoRow label="Mô tả" value={<span className="text-slate-500 text-xs leading-relaxed">{data.product.description}</span>} />
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Batch info ── */}
        <SectionCard icon={<Factory size={16} />} title="Thông tin lô sản xuất" iconColor="text-emerald-500">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <InfoRow label="Mã lô hàng" value={<span className="font-mono font-bold text-slate-900">{data.batch.batchCode}</span>} />
            </div>
            <InfoRow label="Nhà sản xuất" value={data.batch.manufacturerName || 'Không xác định'} />
            <InfoRow label="Nhà cung cấp" value={data.batch.supplierName || 'N/A'} />
            <InfoRow label="Ngày sản xuất" value={
              <span className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{fmtDate(data.batch.manufactureDate)}</span>
            } />
            <InfoRow label="Hạn sử dụng" value={
              <span className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{fmtDate(data.batch.expiryDate)}</span>
            } />
            <InfoRow label="Xuất xứ" value={
              <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{data.batch.originCountry || 'N/A'}</span>
            } />
            <InfoRow label="Nơi sản xuất" value={data.batch.productionPlace || 'N/A'} />
            <InfoRow label="Trạng thái lô" value={
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-semibold uppercase">
                {data.batch.batchStatus}
              </span>
            } />
          </div>
        </SectionCard>

        {/* ── Item detail ── */}
        <SectionCard icon={<Info size={16} />} title="Chi tiết sản phẩm đơn lẻ" iconColor="text-purple-500">
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Item Code" value={<span className="font-mono text-xs">{data.itemCode}</span>} />
            <InfoRow label="Serial Number" value={<span className="font-mono text-xs">{data.serialNumber || 'Chưa định danh'}</span>} />
          </div>
        </SectionCard>

        {/* ── Location ── */}
        {data.location && (
          <SectionCard icon={<MapPin size={16} />} title="Vị trí hiện tại" iconColor="text-teal-500">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Tên địa điểm" value={data.location.name} />
              <InfoRow label="Loại" value={data.location.type} />
              {data.location.address && (
                <div className="col-span-2">
                  <InfoRow label="Địa chỉ" value={`${data.location.address}${data.location.city ? ', ' + data.location.city : ''}`} />
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── Ownership ── */}
        {data.ownership && (
          <SectionCard icon={<User size={16} />} title="Thông tin sở hữu" iconColor="text-indigo-500">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <InfoRow label="Chủ sở hữu" value={<span className="font-semibold text-slate-900">{data.ownership.ownerName}</span>} />
              </div>
              <InfoRow label="Loại sở hữu" value={data.ownership.ownershipType} />
              <InfoRow label="Ngày đăng ký" value={
                <span className="flex items-center gap-1"><Clock size={11} className="text-slate-400" />{fmtDate(data.ownership.registeredAt)}</span>
              } />
              <InfoRow label="Trạng thái" value={
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-semibold uppercase">
                  {data.ownership.status}
                </span>
              } />
            </div>
          </SectionCard>
        )}

        {/* ── Trace history ── */}
        {data.traceHistory && data.traceHistory.length > 0 && (
          <SectionCard icon={<Activity size={16} />} title="Lịch sử truy vết" iconColor="text-amber-500">
            <div className="space-y-3">
              {data.traceHistory.map((event, idx) => (
                <div key={idx} className="border-l-2 border-blue-200 pl-3 py-1 relative">
                  <div className="absolute -left-[5px] top-3 w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                  {event.description && <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-[10px] text-slate-400">{fmtDateTime(event.occurredAt)}</span>
                    {event.actorName && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><User size={9} />{event.actorName}</span>}
                    {event.location && <span className="text-[10px] text-blue-500 flex items-center gap-0.5"><MapPin size={9} />{event.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Action buttons (CUSTOMER logged in) ── */}
        {isCustomer ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <ClipboardList size={15} className="text-amber-500" />
              <h2 className="font-semibold text-slate-800 text-sm">Hành động nhanh</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate(`/customer/ownership/register?itemCode=${data.itemCode}`)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl transition-all text-sm shadow-sm shadow-blue-200"
              >
                <ClipboardList size={15} />
                Đăng ký sở hữu
              </button>
              <button
                onClick={() => navigate(`/customer/warranty?itemCode=${data.itemCode}`)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-xl transition-all text-sm shadow-sm shadow-emerald-200"
              >
                <ShieldPlus size={15} />
                Yêu cầu bảo hành
              </button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Bạn chưa đăng nhập</p>
              <p className="text-xs text-slate-500 mt-0.5">Đăng nhập để đăng ký sở hữu hoặc yêu cầu bảo hành.</p>
            </div>
            <button
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.href)}`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm whitespace-nowrap shrink-0"
            >
              <LogIn size={14} />
              Đăng nhập
            </button>
          </div>
        ) : null}

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 pt-2">
          © 2026 ProductTrace-AI · Hệ thống minh bạch nguồn gốc sản phẩm
        </p>

      </div>
    </div>
  );
}

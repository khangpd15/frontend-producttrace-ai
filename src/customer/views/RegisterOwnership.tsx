import { useState, useRef, useEffect } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { useRequestOTP, useRegisterOwnership } from '../../features/ownership/hooks/useOwnership';
import { traceApi } from '../../features/trace/api/trace.api';
import { parseApiError } from '../../api/axios';

export function RegisterOwnership({ onBack }: { onBack: () => void }) {
  const { user } = useAuthStore();
  const [view, setView] = useState<'form' | 'otp'>('form');
  const [qrCode, setQrCode] = useState(new URLSearchParams(window.location.search).get('code') || '');
  const [productId, setProductId] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pre-fill owner details from current user store
  const [ownerDetails, setOwnerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setOwnerDetails({
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const requestOTPMutation = useRequestOTP();
  const registerMutation = useRegisterOwnership();

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleRegisterClick = async () => {
    if (!qrCode.trim()) {
      setErrorMsg('Vui lòng nhập mã sản phẩm hoặc Serial');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Step 1: Trace search to get product item details & product_id (itemId)
      const traceRes = await traceApi.search({ code: qrCode.trim() });
      const productItem = traceRes.data.data?.productItem;

      if (!productItem || !productItem.itemId) {
        setErrorMsg('Không tìm thấy sản phẩm hợp lệ với mã/serial này.');
        setIsLoading(false);
        return;
      }

      setProductId(productItem.itemId);

      // Step 2: Request OTP via backend
      const otpRes = await requestOTPMutation.mutateAsync({ qr_code: qrCode.trim() });
      setTargetEmail((otpRes.data.data as any)?.email || user?.email || '');
      setView('otp');
    } catch (err: any) {
      setErrorMsg(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setErrorMsg('Vui lòng nhập đủ mã OTP 6 chữ số.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await registerMutation.mutateAsync({ otp: otpString, product_id: productId || qrCode });
      alert('Đã đăng ký sở hữu! Yêu cầu của bạn đang chờ Admin phê duyệt.');
      onBack();
    } catch (err: any) {
      setErrorMsg(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Đăng ký sở hữu" showBack={true} onBackClick={onBack} />
      <div className="p-4">
        <Card className="p-4 space-y-4">
          <h2 className="font-bold text-lg">Thông tin sản phẩm</h2>
          {errorMsg && (
            <div className="p-3 text-xs bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Mã sản phẩm / Serial</label>
              <input
                type="text"
                placeholder="Nhập mã hoặc Serial"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                disabled={view === 'otp'}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tên chủ sở hữu</label>
              <input
                type="text"
                value={ownerDetails.name}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={ownerDetails.email}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Số điện thoại</label>
              <input
                type="tel"
                value={ownerDetails.phone}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            {view === 'form' && (
              <Button className="w-full" onClick={handleRegisterClick} disabled={isLoading}>
                {isLoading ? 'Đang gửi...' : 'Đăng ký'}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {view === 'otp' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-4 space-y-6 w-full max-w-sm">
            <h2 className="font-bold text-lg text-center">Nhập mã xác thực</h2>
            <p className="text-sm text-slate-500 text-center">
              Chúng tôi đã gửi mã xác thực 6 số đến email:{' '}
              <strong className="text-slate-800">{targetEmail}</strong>
            </p>
            {errorMsg && (
              <div className="p-3 text-xs bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {errorMsg}
              </div>
            )}
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className="w-10 h-12 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setView('form')} disabled={isLoading}>
                Quay lại
              </Button>
              <Button className="flex-1" onClick={handleVerifyOTP} disabled={isLoading}>
                {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default RegisterOwnership;

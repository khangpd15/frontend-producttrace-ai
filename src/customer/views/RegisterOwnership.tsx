import { useState, useRef } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ownershipApi } from '../../features/ownership/api/ownership.api';

export function RegisterOwnership({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'form' | 'otp'>('form');
  const [qrCode, setQrCode] = useState(new URLSearchParams(window.location.search).get('code') || '');
  const [productId, setProductId] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleRequestOTP = async () => {
    try {
      setError('');
      if (!qrCode.trim()) {
        setError('Vui lòng nhập mã sản phẩm hoặc mã QR');
        return;
      }
      setLoading(true);
      const res = await ownershipApi.requestOTP({ qr_code: qrCode });
      if (res.data?.data?.product_id) {
        setProductId(res.data.data.product_id);
      }
      setView('otp');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra khi yêu cầu OTP. Sản phẩm không tồn tại hoặc đã được đăng ký.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setError('');
      const code = otp.join('');
      if (code.length < 6) {
        setError('Vui lòng nhập đủ 6 số OTP');
        return;
      }
      setLoading(true);
      // product_id was captured from the step 1 response
      await ownershipApi.verifyAndRegister({ otp: code, product_id: productId || qrCode });
      alert('Đăng ký sở hữu thành công!');
      onBack();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Đăng ký sở hữu" showBack={true} onBackClick={onBack} />
      <div className="p-4">
        <Card className="p-4 space-y-4">
            <h2 className="font-bold text-lg">Thông tin sản phẩm</h2>
            <div className="space-y-4">
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                <div className="space-y-1">
                    <label className="text-sm font-medium">Mã sản phẩm / Serial (QR Code)</label>
                    <input 
                      type="text" 
                      placeholder="Nhập mã hoặc Serial" 
                      className="w-full p-3 border rounded-lg"
                      value={qrCode}
                      onChange={e => setQrCode(e.target.value)}
                    />
                </div>
                <p className="text-xs text-slate-500">Thông tin cá nhân của bạn sẽ tự động được đồng bộ từ hồ sơ tài khoản.</p>
                <Button className="w-full" disabled={!qrCode || loading} onClick={handleRequestOTP}>
                  {loading ? 'Đang xử lý...' : 'Đăng ký & Nhận OTP'}
                </Button>
            </div>
        </Card>
      </div>

      {view === 'otp' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-4 space-y-6 w-full max-w-sm">
              <h2 className="font-bold text-lg text-center">Nhập mã xác thực</h2>
              <p className="text-sm text-slate-500 text-center">Chúng tôi đã gửi mã xác thực 6 số đến email hoặc số điện thoại của bạn</p>
              <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                      <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          ref={(el) => { inputRefs.current[index] = el; }}
                          className="w-10 h-12 text-center text-xl font-bold border rounded-lg"
                      />
                  ))}
              </div>
              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
              <Button className="w-full" disabled={loading} onClick={handleVerify}>Xác nhận</Button>
              <Button className="w-full" variant="outline" onClick={() => setView('form')}>Hủy</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

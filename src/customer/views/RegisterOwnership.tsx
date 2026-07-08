import { useState, useRef } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function RegisterOwnership({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
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

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Đăng ký sở hữu" showBack={true} onBackClick={onBack} />
      <div className="p-4">
        <Card className="p-4 space-y-4">
            <h2 className="font-bold text-lg">Thông tin sản phẩm</h2>
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Mã sản phẩm / Serial</label>
                    <input type="text" placeholder="Nhập mã hoặc Serial" className="w-full p-3 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Tên chủ sở hữu</label>
                    <input type="text" placeholder="Nhập tên người sở hữu" className="w-full p-3 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <input type="email" placeholder="Nhập email" className="w-full p-3 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input type="tel" placeholder="Nhập số điện thoại" className="w-full p-3 border rounded-lg" />
                </div>
                <Button className="w-full" onClick={() => setView('otp')}>Đăng ký</Button>
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
              <Button className="w-full" onClick={() => { setView('form'); onBack(); }}>Xác nhận</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

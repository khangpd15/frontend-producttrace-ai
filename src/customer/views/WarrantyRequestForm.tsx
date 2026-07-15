import React, { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { warrantyApi } from '../../features/warranty/api/warranty.api';
import { parseApiError } from '../../api/axios';

interface Props {
  onBack: () => void;
  productId: string;
}

export function WarrantyRequestForm({ onBack, productId }: Props) {
  const [issueTitle, setIssueTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!issueTitle.trim()) {
      setError('Vui lòng nhập tiêu đề sự cố.');
      return;
    }
    if (!description.trim()) {
      setError('Vui lòng mô tả chi tiết sự cố.');
      return;
    }
    if (!contactPhone.trim()) {
      setError('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    setIsLoading(true);
    try {
      await warrantyApi.createClaim({
        product_id: productId,
        issue_title: issueTitle.trim(),
        issue_description: description.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopAppBar title="Yêu cầu bảo hành" showBack={true} onBackClick={onBack} />
        <div className="pt-20 p-4 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
          <h2 className="text-lg font-bold text-slate-900">Gửi yêu cầu thành công!</h2>
          <p className="text-sm text-slate-500 max-w-xs">
            Yêu cầu bảo hành của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ trong 24 giờ.
          </p>
          <button
            onClick={onBack}
            className="mt-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopAppBar title="Yêu cầu bảo hành" showBack={true} onBackClick={onBack} />
      <div className="pt-20 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <h2 className="font-bold text-slate-900">Thông tin sự cố</h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Tiêu đề sự cố *"
              value={issueTitle}
              onChange={e => setIssueTitle(e.target.value)}
              placeholder="Ví dụ: Màn hình bị vỡ, sản phẩm không hoạt động..."
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mô tả chi tiết sự cố *
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả đầy đủ vấn đề bạn gặp phải, thời điểm xảy ra, tình trạng hiện tại..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <h2 className="font-bold text-slate-900">Thông tin liên hệ</h2>

            <Input
              label="Số điện thoại *"
              type="tel"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="0901 234 567"
              required
            />

            <Input
              label="Email (không bắt buộc)"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu bảo hành'}
          </Button>
        </form>
      </div>
    </div>
  );
}

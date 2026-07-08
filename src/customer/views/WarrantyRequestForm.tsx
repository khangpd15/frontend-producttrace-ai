import React, { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function WarrantyRequestForm({ onBack, productId }: { onBack: () => void; productId: string }) {
  const [description, setDescription] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted warranty request for', productId, { description, invoiceNumber });
    onBack();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopAppBar title="Yêu cầu bảo hành" showBack={true} onBackClick={onBack} />
      <div className="pt-20 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <h2 className="font-bold">Thông tin yêu cầu</h2>
            <Input 
              label="Mô tả sự cố"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả vấn đề bạn gặp phải..."
            />
            <Input 
              label="Số hóa đơn (nếu có)"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Nhập số hóa đơn..."
            />
          </Card>
          <Button type="submit" className="w-full">Gửi yêu cầu</Button>
        </form>
      </div>
    </div>
  );
}

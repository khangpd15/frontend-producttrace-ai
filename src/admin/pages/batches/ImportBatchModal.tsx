import React, { useState, useEffect } from 'react';
import { ArrowDownRight, CheckCircle, X, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { batchApi } from '../../../features/batch/api/batch.api';
import type { BatchListItem } from '../../../features/batch/api/batch.types';
import { parseApiError } from '../../../api/axios';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportBatchModal({ onClose, onSuccess }: Props) {
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');

  // Load incoming batches on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    batchApi.getIncomingBatches()
      .then(res => {
        setBatches(res.data.data ?? []);
      })
      .catch(err => {
        console.error('Lỗi tải danh sách lô hàng đang vận chuyển', err);
        setError(parseApiError(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const toggleBatch = (id: string) => {
    setSelectedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const totalItems = batches
    .filter(b => selectedBatches.includes(b.id))
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const handleImport = async () => {
    if (selectedBatches.length === 0) return;
    setIsImporting(true);
    setError(null);
    try {
      await batchApi.importBatches({
        batch_ids: selectedBatches,
        note: note.trim() || undefined,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Nhập lô hàng (Incoming Batch)</h3>
            <p className="text-sm text-slate-500">Nhận lô hàng đang trên đường vận chuyển (IN_TRANSIT). Toàn bộ Product Item sẽ chuyển sang IN_STOCK.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-500" type="button" disabled={isImporting}><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0">!</div>
              <div>
                <h4 className="font-bold text-red-900">Không thể thực hiện</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-green-900">Nhập kho thành công (Import Completed)</h4>
                <p className="text-sm text-green-700">Hệ thống đã nhận kho {selectedBatches.length} lô hàng tương ứng với {totalItems} Product Items sang trạng thái lưu kho (IN_STOCK).</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT PANEL */}
            <div className="flex-1 w-full space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900">Danh sách lô hàng đang vận chuyển đến</h3>
              <p className="text-sm text-slate-500 mb-4">Chỉ hiển thị các lô hàng có trạng thái vận chuyển IN_TRANSIT hướng tới địa điểm của bạn.</p>
              
              {isLoading ? (
                <div className="py-12 text-center text-slate-500 font-semibold">Đang tải danh sách lô hàng...</div>
              ) : batches.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <AlertTriangle size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">Không có lô hàng nào đang vận chuyển đến địa điểm của bạn</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300"
                            onChange={(e) => setSelectedBatches(e.target.checked ? batches.map(b => b.id) : [])}
                            checked={selectedBatches.length === batches.length && batches.length > 0}
                          />
                        </th>
                        <th className="p-3 font-semibold">Mã Lô</th>
                        <th className="p-3 font-semibold">Biến Thể</th>
                        <th className="p-3 font-semibold text-center">Số lượng</th>
                        <th className="p-3 font-semibold">Ngày sản xuất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batches.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300"
                              checked={selectedBatches.includes(b.id)}
                              onChange={() => toggleBatch(b.id)}
                            />
                          </td>
                          <td className="p-3 font-bold text-slate-800">{b.batch_code}</td>
                          <td className="p-3 text-slate-600">{b.variant_name}</td>
                          <td className="p-3 text-center font-semibold text-slate-700">{b.quantity}</td>
                          <td className="p-3 text-slate-500">{b.manufacture_date ? new Date(b.manufacture_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:w-[350px] bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-0 shrink-0">
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-3">Xác nhận Nhập Kho</h3>
              
              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Đồng bộ dữ liệu (Integrity Check)</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Lô hàng chuẩn bị nhập</span>
                  <span className="font-bold text-blue-600">{selectedBatches.length} Lô</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                  <span className="text-slate-500 font-semibold">Cần đối soát & Nhập đủ</span>
                  <span className="font-bold text-blue-600">{totalItems} Product Items</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú nhập kho</label>
                <textarea 
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Nhập ghi chú (nếu có)..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  disabled={isImporting || isSuccess}
                />
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleImport} 
                  disabled={selectedBatches.length === 0 || isSuccess || isImporting} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 shadow-md flex items-center justify-center gap-2"
                >
                  {isImporting ? `Đang đối soát ${totalItems} Items...` : <><ArrowDownRight size={18} /> Xác nhận Nhập Đủ {totalItems > 0 ? totalItems : ''} Product Items</>}
                </Button>
                <Button variant="secondary" onClick={onClose} disabled={isImporting} className="w-full bg-slate-50 border border-slate-300 font-semibold py-3">
                  Cancel
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

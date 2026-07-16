import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle, AlertTriangle, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useLocations } from '../../../features/location/hooks/useLocations';
import { useExportBatches } from '../../../features/batch/hooks/useExportBatches';
import { BatchListItem } from '../../../features/batch/api/batch.types';

interface Props {
  selectedBatches: BatchListItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExportBatchModal({ selectedBatches, onClose, onSuccess }: Props) {
  const { locations, isLoading: isLoadingLocations, error: locationsError } = useLocations();
  const { exportBatches, isExporting, exportError, reset } = useExportBatches();

  const [destination, setDestination] = useState('');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedBatches.length === 0) {
      setFormError('Vui lòng chọn ít nhất một lô hàng để xuất');
      return;
    }

    const invalid = selectedBatches.filter(b => b.status !== 'IN_STOCK');
    if (invalid.length > 0) {
      setFormError('Chỉ cho phép xuất các lô hàng ở trạng thái IN_STOCK. Lô hàng không hợp lệ: ' + invalid.map(x => x.batch_code).join(', '));
      return;
    }

    if (!destination) {
      setFormError('Vui lòng chọn địa điểm nhận hàng (Kho nhận)');
      return;
    }

    const result = await exportBatches({
      batch_ids: selectedBatches.map(b => b.id),
      destination_location_id: destination,
      note: note.trim() || undefined,
    });

    if (result) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const totalItems = selectedBatches.reduce((acc, curr) => acc + curr.quantity, 0);
  const errorMsg = formError || exportError || locationsError;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Xuất lô hàng (Export Batch)</h3>
            <p className="text-sm text-slate-500">Chuyển lô hàng sang kho/đại lý khác. Toàn bộ Product Item sẽ chuyển sang IN_TRANSIT.</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-500" type="button" disabled={isExporting}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0">!</div>
              <div>
                <h4 className="font-bold text-red-900">Không thể thực hiện xuất kho</h4>
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-green-900">Xuất kho hoàn tất (Export Completed)</h4>
                <p className="text-sm text-green-700">Hệ thống đã khóa và chuyển chính xác <strong>{totalItems.toLocaleString()}/{totalItems.toLocaleString()} Product Items</strong> sang trạng thái IN_TRANSIT. Không có sản phẩm nào bị thất lạc.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleExport} className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT PANEL */}
            <div className="flex-1 w-full space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900">Selected Batches</h3>
              <p className="text-sm text-slate-500 mb-4">Các lô hàng đã được tích chọn từ danh sách chính sẽ được xuất hàng loạt.</p>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold">Mã Lô Hàng</th>
                      <th className="p-3 font-semibold">Sản phẩm</th>
                      <th className="p-3 font-semibold text-center">Số lượng xuất</th>
                      <th className="p-3 font-semibold text-right">Trạng thái lô</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBatches.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-800">{b.batch_code}</td>
                        <td className="p-3 text-slate-600 font-semibold">{b.variant_name}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{b.quantity.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-green-100 text-green-700 border border-transparent">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {selectedBatches.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          Chưa chọn lô hàng nào từ bảng chính.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:w-[350px] bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-0 shrink-0">
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-3">Thông tin nhận hàng</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kho nhận (Warehouse) *</label>
                {isLoadingLocations ? (
                  <div className="w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">
                    Đang tải danh sách kho nhận...
                  </div>
                ) : (
                  <select 
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 shadow-sm focus:bg-white outline-none focus:border-blue-500"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    disabled={isExporting || isSuccess}
                  >
                    <option value="">-- Chọn nơi nhận --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.city ? `(${loc.city})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú (Note)</label>
                <textarea 
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm resize-none focus:bg-white outline-none focus:border-blue-500"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ghi chú xuất hàng cho đại lý/kho nhận..."
                  rows={3}
                  disabled={isExporting || isSuccess}
                />
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Tóm tắt xuất kho</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số lô hàng xuất</span>
                  <span className="font-bold text-blue-600">{selectedBatches.length} Lô</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số lượng sản phẩm</span>
                  <span className="font-bold text-blue-600">{totalItems.toLocaleString()} Items</span>
                </div>
              </div>

              {selectedBatches.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6 flex items-start gap-2 text-amber-800 text-xs">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Bảo toàn dữ liệu:</strong> Toàn bộ {totalItems.toLocaleString()} Product Items thuộc các lô này sẽ được tự động cập nhật sang trạng thái <strong>IN_TRANSIT</strong>. Không thể điều chỉnh số lượng xuất đơn lẻ.
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  disabled={selectedBatches.length === 0 || !destination || isSuccess || isExporting} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 shadow-md flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang thực hiện xuất...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={18} /> 
                      Xuất {totalItems > 0 ? totalItems.toLocaleString() : ''} Sản Phẩm
                    </>
                  )}
                </Button>
                <Button variant="secondary" onClick={handleClose} disabled={isExporting} className="w-full bg-slate-50 border border-slate-300 font-semibold py-3">
                  Hủy bỏ
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

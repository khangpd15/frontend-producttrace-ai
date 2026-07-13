import { useState, useEffect } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck, AlertTriangle, Upload, Check } from 'lucide-react';
import { useOwnershipList } from '../../features/ownership/hooks/useOwnership';
import { useCreateWarrantyClaim } from '../../features/warranty/hooks/useWarranty';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { parseApiError } from '../../api/axios';

export function Warranty({ onBack }: { onBack: () => void }) {
  const { user } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Query and Mutation hooks
  const { data: ownershipsRes, isLoading: isListLoading } = useOwnershipList();
  const createClaimMutation = useCreateWarrantyClaim();

  // Populate contact fields when user profile is ready or when selecting form view
  useEffect(() => {
    if (user) {
      setContactPhone(user.phone || '');
      setContactEmail(user.email || '');
    }
  }, [user]);

  const handleCreateClaim = (product: any) => {
    setSelectedProduct(product);
    setView('form');
    setSubmitted(false);
    setErrorMsg(null);
    setIssueTitle('');
    setIssueDescription('');
  };

  const handleViewDetail = (product: any) => {
    setSelectedProduct(product);
    setView('detail');
  };

  const handleSubmitClaim = async () => {
    if (!issueTitle.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề sự cố.');
      return;
    }
    if (!issueDescription.trim()) {
      setErrorMsg('Vui lòng nhập mô tả sự cố.');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    setErrorMsg(null);

    try {
      await createClaimMutation.mutateAsync({
        product_id: selectedProduct.product_id,
        issue_title: issueTitle.trim(),
        issue_description: issueDescription.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
        attachments: [], // Empty for now
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(parseApiError(err));
    }
  };

  // Standard 2-year warranty calculation from registration date
  const getWarrantyExpireDate = (regDateStr: string) => {
    if (!regDateStr) return 'N/A';
    const regDate = new Date(regDateStr);
    regDate.setFullYear(regDate.getFullYear() + 2);
    return regDate.toLocaleDateString('vi-VN');
  };

  const activeOwnerships = ownershipsRes?.data || [];

  // TODO(warranty-history): The backend currently only supports creating warranty claims
  // (POST /api/warranty-claims). There is no GET endpoint to list a customer's claim history.
  // When the backend implements GET /api/warranty-claims (e.g., filtered by user_id),
  // replace the ownership-based list below with a dedicated useWarrantyClaimList() hook.
  // Backend module: go-core-service/internal/modules/warranty_claim


  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar
          title="Yêu cầu bảo hành"
          showBack={true}
          onBackClick={() => {
            setView('list');
            setSubmitted(false);
          }}
        />
        <div className="p-4 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mt-10">
            <Check size={32} />
          </div>
          <h2 className="text-xl font-bold">Yêu cầu đã được gửi!</h2>
          <p className="text-slate-500">Chúng tôi sẽ sớm liên hệ với bạn để hỗ trợ.</p>
          <Button
            onClick={() => {
              setView('list');
              setSubmitted(false);
            }}
            className="w-full"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'detail') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Chi tiết bảo hành" showBack={true} onBackClick={() => setView('list')} />
        <div className="p-4 space-y-4">
          <Card className="p-4 space-y-3">
            <h2 className="font-bold text-lg">{selectedProduct?.product_name}</h2>
            <div className="border-t pt-2 space-y-1">
              <p className="text-sm">
                <span className="text-slate-500">Mã SKU:</span> {selectedProduct?.product_sku}
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Ngày kích hoạt:</span>{' '}
                {new Date(selectedProduct?.registration_date).toLocaleDateString('vi-VN')}
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Hạn bảo hành:</span>{' '}
                {getWarrantyExpireDate(selectedProduct?.registration_date)}
              </p>
              <p className="text-sm flex gap-2 items-center">
                <span className="text-slate-500">Trạng thái:</span>
                <Badge variant="success">Còn bảo hành</Badge>
              </p>
            </div>
            <Button onClick={() => handleCreateClaim(selectedProduct)} className="w-full flex gap-2 items-center">
              <AlertTriangle size={16} /> Tạo yêu cầu bảo hành
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Tạo yêu cầu bảo hành" showBack={true} onBackClick={() => setView('list')} />
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <h3 className="font-bold">{selectedProduct?.product_name}</h3>
            <p className="text-sm text-slate-500">SKU: {selectedProduct?.product_sku}</p>
            <p className="text-xs text-slate-400">ID Sản phẩm: {selectedProduct?.product_id}</p>
          </Card>

          {errorMsg && (
            <div className="p-3 text-xs bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tiêu đề sự cố</label>
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                placeholder="Ví dụ: Loa bị rè, Máy không lên nguồn..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Mô tả sự cố</label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Số điện thoại liên hệ</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Nhập số điện thoại liên hệ"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email liên hệ (Không bắt buộc)</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Nhập email liên hệ"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hình ảnh/Video lỗi</label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
                <Upload />
                <span className="text-sm mt-2">Tải lên hình ảnh/video</span>
              </div>
            </div>

            <Button onClick={handleSubmitClaim} disabled={createClaimMutation.isPending} className="w-full">
              {createClaimMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Sản phẩm của tôi" showBack={true} onBackClick={onBack} />
      <div className="p-4 space-y-4">
        {isListLoading ? (
          <div className="text-center py-12 text-slate-500">Đang tải sản phẩm sở hữu...</div>
        ) : activeOwnerships.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Bạn chưa có sản phẩm sở hữu nào để hiển thị bảo hành.
          </div>
        ) : (
          <div className="space-y-3">
            {activeOwnerships.map((product) => (
              <Card key={product.ownership_id} className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-green-500" />
                  <h2 className="font-bold text-base text-slate-800">{product.product_name}</h2>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>SKU: {product.product_sku}</p>
                  <p>Hạn bảo hành: {getWarrantyExpireDate(product.registration_date)}</p>
                </div>
                <Button onClick={() => handleViewDetail(product)} variant="secondary" className="w-full">
                  Xem chi tiết bảo hành
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Warranty;

import { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { ShieldCheck, Package, Bell } from 'lucide-react';

// TODO(notifications-backend): No backend notification API exists yet.
// The backend does not expose any GET /notifications or GET /user/notifications endpoint.
// When the backend implements a notification service, replace the static `notifications` array
// below with a real API call (e.g., GET /notifications?user_id=...) and a loading/error state.
// Backend team reference: create a notification module in go-core-service.

// ── Static mock data — remove when backend is ready ──────────────────────────
const notifications = [
  { id: '1', title: 'Cập nhật bảo hành', message: 'Yêu cầu bảo hành cho Máy lọc nước RO Kangaroo VT3 đã được tiếp nhận.', icon: <ShieldCheck className="text-blue-500" /> },
  { id: '2', title: 'Sản phẩm mới', message: 'Bạn đã đăng ký quyền sở hữu thành công cho Tấm pin JA Solar.', icon: <Package className="text-green-500" /> },
];

export function Notifications({ onBack }: { onBack: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const notification = notifications.find(n => n.id === selectedId);
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Chi tiết thông báo" showBack={true} onBackClick={() => setSelectedId(null)} />
        <div className="p-4">
          <Card className="p-4">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-slate-100 rounded-full">{notification?.icon}</div>
              <h3 className="font-bold text-lg">{notification?.title}</h3>
            </div>
            <p className="text-sm mt-4 text-slate-600 leading-relaxed">{notification?.message}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Thông báo" showBack={false} />
      <div className="p-4 space-y-4">
        {notifications.map(n => (
          <Card key={n.id} className="p-4 flex gap-4 items-start cursor-pointer hover:bg-slate-50" onClick={() => setSelectedId(n.id)}>
            <div className="p-2 bg-slate-100 rounded-full">{n.icon}</div>
            <div>
              <h3 className="font-bold text-sm">{n.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

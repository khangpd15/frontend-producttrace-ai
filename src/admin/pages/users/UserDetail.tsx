import React from 'react';
import { 
  ChevronLeft, Edit2, FileText, AlertCircle, CheckCircle, 
} from 'lucide-react';

// Types for demonstration
type Role = 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
type Status = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

interface UserDetailProps {
  onNavigate: (tabId: string, userId?: string) => void;
  userId?: string; 
}

const UserDetail: React.FC<UserDetailProps> = ({ onNavigate, userId = 'USR-001' }) => {
  const user = {
    id: userId,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    role: 'CUSTOMER' as Role,
    status: 'ACTIVE' as Status,
    createdDate: '12/03/2026',
    lastLogin: '24/06/2026 09:12'
  };

  const StatusBadge = ({ status }: { status: Status }) => {
    const styles: Record<string, string> = {
      ACTIVE: 'text-emerald-600 bg-emerald-50',
      SUSPENDED: 'text-orange-600 bg-orange-50',
      BANNED: 'text-red-600 bg-red-50'
    };
    const labels: Record<string, string> = { ACTIVE: 'ACTIVE', SUSPENDED: 'SUSPENDED', BANNED: 'BANNED' };
    return (
      <span className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${styles[status]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {labels[status]}
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: Role }) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      STAFF: 'bg-blue-100 text-blue-700',
      DEALER: 'bg-orange-100 text-orange-700',
      CUSTOMER: 'bg-gray-100 text-gray-700'
    };
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles[role] || 'bg-gray-100'}`}>{role}</span>;
  };

  return (
    <div className="bg-white p-8 space-y-8 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button onClick={() => onNavigate('users')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
              <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
            </button>
            <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
            <p className="text-sm text-gray-500">Thông tin chi tiết tài khoản người dùng trong hệ thống ProductTrace-AI.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white flex items-center gap-2">
              <FileText className="w-4 h-4" /> Activity Audit
            </button>
            <button onClick={() => onNavigate('edit-user', userId)} className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit User
            </button>
          </div>
        </div>

        {/* User Overview */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">NA</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{user.email}</span>
                <span>•</span>
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Role</div>
              <RoleBadge role={user.role} />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Status</div>
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Thông tin chi tiết</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm"><span className="text-gray-500">Full Name:</span> {user.name}</div>
            <div className="text-sm"><span className="text-gray-500">Email:</span> {user.email}</div>
            <div className="text-sm"><span className="text-gray-500">Phone:</span> {user.phone}</div>
            <div className="text-sm"><span className="text-gray-500">Role:</span> {user.role}</div>
            <div className="text-sm"><span className="text-gray-500">Status:</span> {user.status}</div>
            <div className="text-sm"><span className="text-gray-500">Created Date:</span> {user.createdDate}</div>
            <div className="text-sm"><span className="text-gray-500">Last Login:</span> {user.lastLogin}</div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-1"><CheckCircle className="w-5 h-5 text-green-500" /></div>
              <div>
                <p className="font-semibold text-gray-900">Verified Product</p>
                <p className="text-sm text-gray-500">Customer scanned QR and verified authenticity.</p>
                <p className="text-xs text-gray-400">24/06/2026 08:45</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1"><AlertCircle className="w-5 h-5 text-orange-500" /></div>
              <div>
                <p className="font-semibold text-gray-900">Warranty Claim Submitted</p>
                <p className="text-sm text-gray-500">Customer submitted warranty request.</p>
                <p className="text-xs text-gray-400">23/06/2026 19:12</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default UserDetail;

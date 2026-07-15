import React from 'react';
import { 
  ChevronLeft, Edit2, FileText, AlertCircle, CheckCircle, 
} from 'lucide-react';
import { useUserDetail } from '../../../features/users/hooks/useUsers';
import { parseApiError } from '../../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

type Role = 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
type Status = 'ACTIVE' | 'PENDING' | 'BANNED' | 'SUSPENDED';

interface UserDetailProps {
  onNavigate: (tabId: string, userId?: string) => void;
  userId?: string; 
}

const UserDetail: React.FC<UserDetailProps> = ({ onNavigate, userId }) => {
  if (!userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Thiếu mã người dùng.</p>
        <button onClick={() => onNavigate('users')} className="mt-4 text-blue-600 hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  const { data: user, isLoading, error, refetch } = useUserDetail(userId);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const StatusBadge = ({ status }: { status: Status }) => {
    const styles: Record<string, string> = {
      ACTIVE: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      PENDING: 'text-blue-600 bg-blue-50 border-blue-200',
      SUSPENDED: 'text-orange-600 bg-orange-50 border-orange-200',
      BANNED: 'text-red-600 bg-red-50 border-red-200'
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Hoạt động',
      PENDING: 'Chờ kích hoạt',
      SUSPENDED: 'Tạm ngưng',
      BANNED: 'Bị khóa'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${styles[status] || 'bg-gray-50'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {labels[status] || status}
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: Role }) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
      STAFF: 'bg-blue-100 text-blue-700 border border-blue-200',
      DEALER: 'bg-orange-100 text-orange-700 border border-orange-200',
      CUSTOMER: 'bg-gray-100 text-gray-700 border border-gray-200'
    };
    return <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${styles[role] || 'bg-gray-100 border'}`}>{role}</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 space-y-8 min-h-screen animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-48 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Không thể tải thông tin người dùng</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          {parseApiError(error)}
        </p>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => onNavigate('users')} variant="secondary" className="rounded-xl px-4 text-xs font-semibold cursor-pointer">Quay lại</Button>
          <Button onClick={() => refetch()} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white p-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => onNavigate('users')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h1>
          <p className="text-sm text-gray-500">Thông tin chi tiết tài khoản người dùng trong hệ thống ProductTrace-AI.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('edit-user', userId)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-colors">
            <Edit2 className="w-4 h-4" /> Chỉnh sửa
          </button>
        </div>
      </div>

      {/* User Overview */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-250 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-sm">
            {getInitials(user.full_name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.full_name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{user.email}</span>
              <span>•</span>
              <span>{user.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Vai trò</div>
            <RoleBadge role={user.role as Role} />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
            <StatusBadge status={user.status as Status} />
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Thông tin chi tiết</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div>
            <span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Họ và tên</span>
            <span className="text-gray-900 font-medium">{user.full_name}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Email</span>
            <span className="text-gray-900 font-medium">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Số điện thoại</span>
            <span className="text-gray-900 font-medium">{user.phone}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Vai trò</span>
            <span className="text-gray-900 font-medium uppercase">{user.role}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Trạng thái tài khoản</span>
            <span className="text-gray-900 font-medium uppercase">{user.status}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Ngày tạo tài khoản</span>
            <span className="text-gray-900 font-medium">
              {new Date(user.created_at).toLocaleString('vi-VN')}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs font-semibold uppercase tracking-wider">Cập nhật lần cuối</span>
            <span className="text-gray-900 font-medium">
              {new Date(user.updated_at).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

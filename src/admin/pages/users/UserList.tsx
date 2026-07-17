import React, { useState } from 'react';
import { 
  Search, Trash2, UserPlus, X, Eye, AlertCircle, Inbox, 
  ChevronLeft, ChevronRight, Lock, LockOpen
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useUserList, useDeleteUser, useLockAccount, useUnlockAccount } from '../../../features/users/hooks/useUsers';
import { parseApiError } from '../../../api/axios';

interface UserListProps {
  onNavigate: (tabId: string, userId?: string) => void;
}

const UserList: React.FC<UserListProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [lockUserId, setLockUserId] = useState<string | null>(null);
  const [unlockUserId, setUnlockUserId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useUserList({
    page,
    limit: 10,
    search: searchTerm || undefined,
    role: filterRole !== 'ALL' ? filterRole : undefined,
    status: filterStatus !== 'ALL' ? filterStatus : undefined,
  });

  const deleteMutation = useDeleteUser();
  const lockMutation = useLockAccount();
  const unlockMutation = useUnlockAccount();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteUserId(null);
    } catch (err: any) {
      alert(parseApiError(err));
    }
  };

  const handleLock = async (id: string) => {
    try {
      await lockMutation.mutateAsync(id);
      setLockUserId(null);
    } catch (err: any) {
      alert(parseApiError(err));
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await unlockMutation.mutateAsync(id);
      setUnlockUserId(null);
    } catch (err: any) {
      alert(parseApiError(err));
    }
  };

  const users = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
      STAFF: 'bg-blue-50 text-blue-700 border-blue-200',
      DEALER: 'bg-orange-50 text-orange-700 border-orange-200',
      CUSTOMER: 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[role] || 'bg-gray-100'}`}>
        {role}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      ACTIVE: 'text-green-700 bg-green-50 border-green-200',
      PENDING: 'text-blue-700 bg-blue-50 border-blue-200',
      SUSPENDED: 'text-amber-700 bg-amber-50 border-amber-200',
      BANNED: 'text-red-700 bg-red-50 border-red-200'
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Hoạt động',
      PENDING: 'Chờ kích hoạt',
      SUSPENDED: 'Tạm ngưng',
      BANNED: 'Bị khóa'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'ACTIVE' ? 'bg-green-500' : 
          status === 'PENDING' ? 'bg-blue-500' :
          status === 'SUSPENDED' ? 'bg-amber-500' : 'bg-red-500'
        }`} />
        {labels[status] || status}
      </span>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách người dùng</h1>
          <p className="text-sm text-slate-500">Quản lý tài khoản, đại lý, nhân viên và khách hàng trong hệ sinh thái ProductTrace-AI.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => onNavigate('create-user')} 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm"
          >
            <UserPlus size={15} /> Tạo người dùng
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu người dùng</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            {parseApiError(error)}
          </p>
          <Button onClick={() => refetch()} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm kiếm tên, email, SĐT..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => { setSearchTerm(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Vai trò:</span>
                <select 
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="DEALER">DEALER</option>
                  <option value="CUSTOMER">CUSTOMER</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Trạng thái:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="PENDING">Chờ kích hoạt</option>
                  <option value="SUSPENDED">Tạm ngưng</option>
                  <option value="BANNED">Bị khóa</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('ALL');
                  setFilterStatus('ALL');
                  setPage(1);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy người dùng</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Hệ thống chưa đăng ký tài khoản nào phù hợp.</p>
                <Button onClick={() => onNavigate('create-user')} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Tạo người dùng</Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm table-fixed border-collapse">
                    <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5 font-bold tracking-wider w-[20%]">Họ tên</th>
                        <th className="p-3.5 font-bold tracking-wider w-[22%]">Email</th>
                        <th className="p-3.5 font-bold tracking-wider w-[13%]">SĐT</th>
                        <th className="p-3.5 font-bold tracking-wider w-[11%]">Vai trò</th>
                        <th className="p-3.5 font-bold tracking-wider w-[14%] text-center">Trạng thái</th>
                        <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">Ngày tạo</th>
                        <th className="p-3.5 pr-5 font-bold tracking-wider w-[10%] text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                        <tr 
                          key={u.id} 
                          onClick={() => onNavigate('user-detail', u.id)}
                          className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                        >
                          <td className="p-3.5 pl-5 font-semibold text-slate-900 truncate">{u.full_name}</td>
                          <td className="p-3.5 text-slate-500 truncate">{u.email}</td>
                          <td className="p-3.5 text-slate-500 font-mono text-xs truncate">{u.phone}</td>
                          <td className="p-3.5"><RoleBadge role={u.role} /></td>
                          <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}><StatusBadge status={u.status} /></td>
                          <td className="p-3.5 text-center text-xs text-slate-400 font-medium">
                            {new Date(u.created_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-1">
                              <button 
                                onClick={() => onNavigate('user-detail', u.id)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                                title="Xem chi tiết"
                              >
                                <Eye size={15} />
                              </button>
                              {/* Lock / Unlock */}
                              {u.status === 'ACTIVE' || u.status === 'PENDING' ? (
                                <button 
                                  onClick={() => setLockUserId(u.id)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="Khóa tài khoản"
                                >
                                  <Lock size={15} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setUnlockUserId(u.id)}
                                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="Mở khóa tài khoản"
                                >
                                  <LockOpen size={15} />
                                </button>
                              )}
                              <button 
                                onClick={() => setDeleteUserId(u.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer border-none bg-transparent"
                                title="Xóa người dùng"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-150">
                    <div className="text-xs text-slate-500">
                      Hiển thị trang <span className="font-semibold">{page}</span> / <span className="font-semibold">{totalPages}</span> (Tổng số {total} bản ghi)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Lock Confirmation Modal */}
      {lockUserId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Lock size={18} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Xác nhận khóa tài khoản</h3>
            </div>
            <p className="text-xs text-slate-500">Tài khoản sẽ bị tạm ngưng (SUSPENDED). Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setLockUserId(null)} className="rounded-lg px-4 text-xs font-semibold cursor-pointer">Hủy</Button>
              <Button 
                onClick={() => handleLock(lockUserId)} 
                disabled={lockMutation.isPending}
                className="rounded-lg px-4 text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 cursor-pointer disabled:opacity-55"
              >
                {lockMutation.isPending ? 'Đang khóa...' : 'Xác nhận khóa'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Confirmation Modal */}
      {unlockUserId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <LockOpen size={18} className="text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Xác nhận mở khóa tài khoản</h3>
            </div>
            <p className="text-xs text-slate-500">Tài khoản sẽ được kích hoạt trở lại (ACTIVE). Người dùng có thể đăng nhập ngay sau khi mở khóa.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setUnlockUserId(null)} className="rounded-lg px-4 text-xs font-semibold cursor-pointer">Hủy</Button>
              <Button 
                onClick={() => handleUnlock(unlockUserId)} 
                disabled={unlockMutation.isPending}
                className="rounded-lg px-4 text-xs font-semibold bg-green-600 text-white hover:bg-green-700 cursor-pointer disabled:opacity-55"
              >
                {unlockMutation.isPending ? 'Đang mở khóa...' : 'Xác nhận mở khóa'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl max-w-sm w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Xác nhận xóa</h3>
            <p className="text-xs text-slate-500">Bạn có chắc chắn muốn xóa tài khoản người dùng này không? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDeleteUserId(null)} className="rounded-lg px-4 text-xs font-semibold cursor-pointer">Hủy</Button>
              <Button 
                onClick={() => handleDelete(deleteUserId)} 
                disabled={deleteMutation.isPending}
                className="rounded-lg px-4 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-55"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;

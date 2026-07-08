import React, { useState, useMemo } from 'react';
import { 
  Users, Shield, Settings, User, Search, 
  Trash2, Download, UserPlus, X, Eye, AlertCircle, HelpCircle, Inbox
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface UserListProps {
  onNavigate: (tabId: string, userId?: string) => void;
}

import { AdminUserListUserRecord as UserRecord } from '@shared/types/domain';

const UserList: React.FC<UserListProps> = ({ onNavigate }) => {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR'>('NORMAL');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([
    { id: 'USR-001', name: 'Nguyễn Văn A', email: 'vana@ex.com', phone: '0901234567', role: 'ADMIN', status: 'ACTIVE', date: '2026-06-23' },
    { id: 'USR-002', name: 'Trần Thị B', email: 'thib@ex.com', phone: '0901234568', role: 'DEALER', status: 'SUSPENDED', date: '2026-06-22' },
    { id: 'USR-003', name: 'Lê Văn C', email: 'vanc@ex.com', phone: '0901234569', role: 'STAFF', status: 'ACTIVE', date: '2026-06-21' },
    { id: 'USR-004', name: 'Phạm Thị D', email: 'phamd@ex.com', phone: '0901234570', role: 'CUSTOMER', status: 'BANNED', date: '2026-06-20' },
    { id: 'USR-005', name: 'Hoàng Văn E', email: 'hoange@ex.com', phone: '0901234571', role: 'CUSTOMER', status: 'ACTIVE', date: '2026-06-19' },
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setDeleteUserId(null);
    alert('Đã xóa người dùng thành công!');
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = u.name.toLowerCase().includes(query);
        const matchEmail = u.email.toLowerCase().includes(query);
        const matchPhone = u.phone.includes(query);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      if (filterRole !== 'ALL' && u.role !== filterRole) return false;
      if (filterStatus !== 'ALL' && u.status !== filterStatus) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'A-Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Z-A') return b.name.localeCompare(a.name);
      if (sortBy === 'OLDEST') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [users, searchTerm, filterRole, filterStatus, sortBy]);

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
      SUSPENDED: 'text-amber-700 bg-amber-50 border-amber-200',
      BANNED: 'text-red-700 bg-red-50 border-red-200'
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Hoạt động',
      SUSPENDED: 'Tạm ngưng',
      BANNED: 'Bị khóa'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-green-500' : status === 'SUSPENDED' ? 'bg-amber-500' : 'bg-red-500'}`} />
        {labels[status]}
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
      
      {/* Demo Controls */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Demo Controls</span>
          <span className="text-xs text-blue-600 font-medium">Bấm để chuyển đổi nhanh các trạng thái hiển thị của UI/UX:</span>
        </div>
        <div className="flex gap-2">
          {['NORMAL', 'LOADING', 'EMPTY', 'ERROR'].map(st => (
            <button
              key={st}
              onClick={() => setDemoState(st as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                demoState === st ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {st === 'NORMAL' ? 'Bình thường' : st === 'LOADING' ? 'Đang tải' : st === 'EMPTY' ? 'Trống' : 'Lỗi'}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách người dùng</h1>
          <p className="text-sm text-slate-500">Quản lý tài khoản, đại lý, nhân viên và khách hàng trong hệ sinh thái ProductTrace-AI.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Đang xuất danh sách...')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download size={14} /> Xuất danh sách
          </button>
          <Button 
            onClick={() => onNavigate('create-user')} 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm"
          >
            <UserPlus size={15} /> Tạo người dùng
          </Button>
        </div>
      </div>

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu người dùng</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi kết nối khi tải danh sách người dùng.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm tên, email, SĐT..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Vai trò:</span>
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
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
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="SUSPENDED">Tạm ngưng</option>
                  <option value="BANNED">Bị khóa</option>
                </select>
              </div>

              {/* Sort filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Sắp xếp:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="NEWEST">Mới nhất</option>
                  <option value="OLDEST">Cũ nhất</option>
                  <option value="A-Z">A-Z</option>
                  <option value="Z-A">Z-A</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL' || sortBy !== 'NEWEST') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('ALL');
                  setFilterStatus('ALL');
                  setSortBy('NEWEST');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {demoState === 'EMPTY' || filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy người dùng</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Hệ thống chưa đăng ký tài khoản nào phù hợp.</p>
                <Button onClick={() => onNavigate('create-user')} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Tạo người dùng</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[20%]">Họ tên</th>
                      <th className="p-3.5 font-bold tracking-wider w-[24%]">Email</th>
                      <th className="p-3.5 font-bold tracking-wider w-[14%]">SĐT</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%]">Vai trò</th>
                      <th className="p-3.5 font-bold tracking-wider w-[15%] text-center">Trạng thái</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%] text-center">Ngày tạo</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[10%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr 
                        key={u.id} 
                        onClick={() => onNavigate('user-detail', u.id)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      >
                        <td className="p-3.5 pl-5 font-semibold text-slate-900 truncate">{u.name}</td>
                        <td className="p-3.5 text-slate-500 truncate">{u.email}</td>
                        <td className="p-3.5 text-slate-500 font-mono text-xs truncate">{u.phone}</td>
                        <td className="p-3.5"><RoleBadge role={u.role} /></td>
                        <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}><StatusBadge status={u.status} /></td>
                        <td className="p-3.5 text-center text-xs text-slate-400 font-medium">{u.date}</td>
                        <td className="p-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => onNavigate('user-detail', u.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
                            </button>
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
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl max-w-sm w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Xác nhận xóa</h3>
            <p className="text-xs text-slate-500">Bạn có chắc chắn muốn xóa tài khoản người dùng này không? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDeleteUserId(null)} className="rounded-lg px-4 text-xs font-semibold cursor-pointer">Hủy</Button>
              <Button onClick={() => handleDelete(deleteUserId)} className="rounded-lg px-4 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer">Xác nhận xóa</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserList;

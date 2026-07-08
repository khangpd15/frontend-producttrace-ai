import React, { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';

interface EditUserProps {
  onNavigate: (tabId: string, userId?: string) => void;
  userId?: string;
}

const EditUser: React.FC<EditUserProps> = ({ onNavigate, userId = 'USR-001' }) => {
  const [formData, setFormData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0901234567',
    role: 'CUSTOMER',
    status: 'ACTIVE'
  });

  const handleSubmit = () => {
    console.log('User updated:', formData);
    alert('Cập nhật người dùng thành công!');
    onNavigate('user-detail', userId);
  };

  return (
    <div className="bg-white p-8 space-y-8 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button onClick={() => onNavigate('user-detail', userId)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
              <ChevronLeft className="w-4 h-4" /> Quay lại chi tiết
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-sm text-gray-500">Chỉnh sửa thông tin tài khoản người dùng.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('user-detail', userId)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white">Hủy</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white flex items-center gap-2">
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email (Không thể chỉnh sửa)</label>
                    <input value={formData.email} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Vai trò</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white">
                        <option value="ADMIN">ADMIN</option>
                        <option value="STAFF">STAFF</option>
                        <option value="DEALER">DEALER</option>
                        <option value="CUSTOMER">CUSTOMER</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="BANNED">BANNED</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EditUser;

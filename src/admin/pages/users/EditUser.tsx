import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { useUserDetail, useUpdateUser } from '../../../features/users/hooks/useUsers';
import { parseApiError } from '../../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const editUserSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  full_name: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự'),
  role: z.enum(['ADMIN', 'STAFF', 'DEALER', 'CUSTOMER']),
  status: z.enum(['ACTIVE', 'PENDING', 'BANNED', 'SUSPENDED']),
  password: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserProps {
  onNavigate: (tabId: string, userId?: string) => void;
  userId?: string;
}

const EditUser: React.FC<EditUserProps> = ({ onNavigate, userId }) => {
  if (!userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Thiếu mã người dùng.</p>
        <button onClick={() => onNavigate('users')} className="mt-4 text-blue-600 hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  const { data: user, isLoading, error, refetch } = useUserDetail(userId);
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
  });

  // Pre-fill the form once the user detail has finished loading
  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role as any,
        status: user.status as any,
        password: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: EditUserFormValues) => {
    // If password is empty, don't send it or set to undefined
    const payload = {
      ...values,
      password: values.password || undefined,
    };
    try {
      await updateMutation.mutateAsync({ id: userId, payload });
      alert('Cập nhật người dùng thành công!');
      onNavigate('user-detail', userId);
    } catch (err: any) {
      alert(parseApiError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 space-y-8 min-h-screen animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
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
          <Button onClick={() => onNavigate('user-detail', userId)} variant="secondary" className="rounded-xl px-4 text-xs font-semibold cursor-pointer">Quay lại</Button>
          <Button onClick={() => refetch()} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white p-8 min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button type="button" onClick={() => onNavigate('user-detail', userId)} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2 bg-transparent border-none cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Quay lại chi tiết
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa người dùng</h1>
            <p className="text-sm text-gray-500">Chỉnh sửa thông tin tài khoản người dùng.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => onNavigate('user-detail', userId)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white cursor-pointer">Hủy</button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
              <input 
                {...register('full_name')} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300" 
              />
              {errors.full_name && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.full_name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email * (Dùng để xác thực)</label>
              <input 
                type="email"
                {...register('email')} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-350 bg-gray-50" 
              />
              {errors.email && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
              <input 
                {...register('phone')} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300" 
              />
              {errors.phone && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mật khẩu mới (Để trống nếu không muốn đổi)</label>
              <input 
                type="password"
                {...register('password')} 
                placeholder="Nhập mật khẩu mới"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300" 
              />
              {errors.password && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Vai trò *</label>
              <select 
                {...register('role')} 
                className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 cursor-pointer"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
                <option value="DEALER">DEALER</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
              {errors.role && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.role.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Trạng thái *</label>
              <select 
                {...register('status')} 
                className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 cursor-pointer"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="PENDING">Chờ kích hoạt</option>
                <option value="SUSPENDED">Tạm ngưng</option>
                <option value="BANNED">Bị khóa</option>
              </select>
              {errors.status && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.status.message}</p>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

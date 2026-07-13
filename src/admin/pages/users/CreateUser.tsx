import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Shield, Settings, User, ChevronLeft, AlertCircle, Check
} from 'lucide-react';
import { useCreateUser } from '../../../features/users/hooks/useUsers';
import { parseApiError } from '../../../api/axios';
import Button from '../../components/ui/Button';

const createUserSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  full_name: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.string().min(1, 'Vui lòng chọn vai trò'),

});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserProps {
  onNavigate: (tabId: string, userId?: string) => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onNavigate }) => {
  const createMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: undefined,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      await createMutation.mutateAsync(values as any);
      alert('Tạo người dùng thành công!');
      onNavigate('users');
    } catch (err: any) {
      alert(parseApiError(err));
    }
  };

  const RoleCard = ({ role, label, icon: Icon, color }: any) => {
    const isSelected = selectedRole === role;
    const colors: Record<string, string> = {
      purple: 'border-purple-200 bg-purple-50',
      blue: 'border-blue-200 bg-blue-50',
      orange: 'border-orange-200 bg-orange-50',
      gray: 'border-gray-200 bg-gray-50'
    };
    return (
      <div 
        onClick={() => setValue('role', role, { shouldValidate: true })}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? colors[color] : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-white' : 'bg-gray-100'}`}><Icon className="w-5 h-5" /></div>
          {isSelected && <Check className="w-5 h-5 text-blue-600" />}
        </div>
        <h4 className="font-semibold text-gray-900">{label}</h4>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button type="button" onClick={() => onNavigate('users')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2 bg-transparent border-none cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Tạo người dùng</h1>
            <p className="text-sm text-gray-500">Tạo mới tài khoản và phân quyền truy cập hệ thống ProductTrace-AI.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => onNavigate('users')} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white cursor-pointer">Hủy</button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo người dùng'}
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900">Thông tin người dùng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
              <input 
                {...register('full_name')} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300" 
              />
              {errors.full_name && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.full_name.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input 
                type="email" 
                {...register('email')} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300" 
              />
              {errors.email && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mật khẩu *</label>
              <input 
                type="password" 
                {...register('password')} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300" 
              />
              {errors.password && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
              <input 
                {...register('phone')} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300" 
              />
              {errors.phone && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900">Vai trò *</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RoleCard role="ADMIN" label="Quản trị viên" icon={Shield} color="purple" />
            <RoleCard role="STAFF" label="Nhân viên kho" icon={Settings} color="blue" />
            <RoleCard role="DEALER" label="Đại lý / Cửa hàng" icon={User} color="orange" />
            <RoleCard role="CUSTOMER" label="Khách hàng" icon={User} color="gray" />
          </div>
          {errors.role && <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.role.message}</p>}
        </div>
      </form>
    </div>
  );
};

export default CreateUser;

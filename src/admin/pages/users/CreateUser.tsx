import React, { useState } from 'react';
import { 
  Users, Shield, Settings, User, Mail, Phone, Upload, 
  Check, AlertCircle, X, ChevronLeft 
} from 'lucide-react';

type Role = 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
type Status = 'ACTIVE' | 'SUSPENDED';

interface CreateUserProps {
  onNavigate: (tabId: string, userId?: string) => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onNavigate }) => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '' as Role | '',
    status: 'ACTIVE' as Status,
    otp: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]$/.test(value) || value === '') {
        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);
        if (value !== '' && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    }
  };

  const validateInitial = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.length < 3) newErrors.name = 'Vui lòng nhập họ tên (ít nhất 3 ký tự)';
    if (!formData.email.includes('@')) newErrors.email = 'Email không hợp lệ';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!formData.role) newErrors.role = 'Vui lòng chọn vai trò';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialSubmit = () => {
    if (validateInitial()) {
      setIsVerificationStep(true);
    }
  };

  const handleFinalSubmit = () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
        setErrors({...errors, otp: 'Vui lòng nhập đủ 6 chữ số'});
        return;
    }
    console.log('User created:', formData, 'OTP:', otp);
    alert('Tạo người dùng thành công!');
    onNavigate('users');
  };

  const RoleCard = ({ role, label, icon: Icon, color }: any) => {
    const isSelected = formData.role === role;
    const colors: Record<string, string> = {
      purple: 'border-purple-200 bg-purple-50',
      blue: 'border-blue-200 bg-blue-50',
      orange: 'border-orange-200 bg-orange-50',
      gray: 'border-gray-200 bg-gray-50'
    };
    return (
      <div 
        onClick={() => setFormData({ ...formData, role })}
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button onClick={() => onNavigate('users')} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2">
              <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Tạo người dùng</h1>
            <p className="text-sm text-gray-500">Tạo mới tài khoản và phân quyền truy cập hệ thống ProductTrace-AI.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('users')} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white">Hủy</button>
            <button onClick={isVerificationStep ? handleFinalSubmit : handleInitialSubmit} className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white">Tạo người dùng</button>
          </div>
        </div>

        {/* User Info */}
          <div className="p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Thông tin người dùng</h3>
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Mật khẩu *</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Vai trò</h3>
            <div className="grid grid-cols-4 gap-4">
              <RoleCard role="ADMIN" label="Quản trị viên" icon={Shield} color="purple" />
              <RoleCard role="STAFF" label="Nhân viên kho" icon={Settings} color="blue" />
              <RoleCard role="DEALER" label="Đại lý / Cửa hàng" icon={User} color="orange" />
              <RoleCard role="CUSTOMER" label="Khách hàng" icon={User} color="gray" />
            </div>
            {errors.role && <p className="text-xs text-red-600">{errors.role}</p>}
          </div>

        {/* OTP Modal */}
        {isVerificationStep && (
          <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Xác thực OTP</h3>
                <p className="text-sm text-gray-500">Vui lòng nhập mã OTP đã gửi đến email của bạn</p>
              </div>
              <div className="flex gap-2 justify-center">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-10 h-12 border border-gray-300 rounded-lg text-center font-bold text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ))}
              </div>
              {errors.otp && <p className="text-xs text-red-600 text-center">{errors.otp}</p>}
              <div className="flex gap-3">
                <button onClick={() => setIsVerificationStep(false)} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700">Hủy</button>
                <button onClick={handleFinalSubmit} className="flex-1 px-4 py-2 bg-blue-600 rounded-xl text-sm font-semibold text-white">Xác nhận</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateUser;

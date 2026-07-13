import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, Phone, LogOut } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { authApi } from '../../features/auth/api/auth.api';

export function Profile({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { user: currentUser, logout, fetchProfile } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync profile data when component mounts or user updates
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setPhone(currentUser.phone || '');
      setAvatar(currentUser.avatar || '');
      setAvatarPreview(currentUser.avatar || '');
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Kích thước ảnh không được vượt quá 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Vui lòng chỉ chọn tệp hình ảnh');
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isEditing) {
        if (!fullName.trim()) {
          throw new Error('Họ và tên không được để trống');
        }
        if (!phone.trim()) {
          throw new Error('Số điện thoại không được để trống');
        }

        if (currentUser?.id) {
          await authApi.updateProfile(currentUser.id, {
            full_name: fullName.trim(),
            phone: phone.trim(),
            avatar: avatar || undefined,
          });
          await fetchProfile();
          setSuccessMsg('Cập nhật thông tin thành công!');
          setIsEditing(false);
        }
      }

      if (showPasswordForm) {
        if (!passwords.old) {
          throw new Error('Vui lòng nhập mật khẩu cũ');
        }
        if (passwords.new.length < 8) {
          throw new Error('Mật khẩu mới phải từ 8 ký tự trở lên');
        }
        if (passwords.new !== passwords.confirm) {
          throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
        }

        await authApi.changePassword({
          current_password: passwords.old,
          new_password: passwords.new,
          confirm_password: passwords.confirm,
        });

        setSuccessMsg('Đổi mật khẩu thành công!');
        setShowPasswordForm(false);
        setPasswords({ old: '', new: '', confirm: '' });
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Thao tác thất bại.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Cá nhân" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="flex flex-col items-center gap-3 border-b pb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-50 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-blue-500" />
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-semibold">Thay đổi</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="text-center">
              <h2 className="font-bold text-lg text-slate-800">{currentUser?.full_name || 'Khách hàng'}</h2>
              <p className="text-sm text-slate-500">{currentUser?.email || 'N/A'}</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs bg-green-100 border border-green-200 text-green-700 rounded-lg">
              {successMsg}
            </div>
          )}
          
          <div className="space-y-4 pt-2">
            {!showPasswordForm && (
              <>
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Họ và tên</label>
                  {isEditing ? (
                    <input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-slate-50 rounded-lg">
                      <User size={16} className="text-slate-400" />
                      <span>{fullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Số điện thoại</label>
                  {isEditing ? (
                    <input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-slate-50 rounded-lg">
                      <Phone size={16} className="text-slate-400" />
                      <span>{phone}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {showPasswordForm && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Đổi mật khẩu</h3>
                <input 
                  type="password"
                  placeholder="Mật khẩu cũ"
                  value={passwords.old} 
                  onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={passwords.new} 
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={passwords.confirm} 
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="pt-4 space-y-2">
            {isEditing || showPasswordForm ? (
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    setShowPasswordForm(false);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setFullName(currentUser?.full_name || '');
                    setPhone(currentUser?.phone || '');
                    setAvatar(currentUser?.avatar || '');
                    setAvatarPreview(currentUser?.avatar || '');
                    setPasswords({ old: '', new: '', confirm: '' });
                  }} 
                  variant="secondary" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : 'Lưu thông tin'}
                </Button>
              </div>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="secondary" className="w-full">Chỉnh sửa</Button>
                <Button onClick={() => setShowPasswordForm(true)} variant="secondary" className="w-full">Đổi mật khẩu</Button>
                <Button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 mt-4 !bg-red-600 hover:!bg-red-700 text-white">
                  <LogOut size={16} /> Đăng xuất
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Profile;

import { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { useEffect } from "react";
import { authApi } from "@/features/auth/api/auth.api";

export function Profile({ onBack }: { onBack: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    id: '',
    full_name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM'
  });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const showMsg = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadProfile = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.data?.data) {
        const p = res.data.data;
        setUser(prev => ({ ...prev, id: p.id || '', full_name: p.full_name || '', email: p.email || '', phone: p.phone || '' }));
      }
    } catch (error) {
      console.error('Lỗi lấy profile:', error);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isEditing) {
        await authApi.updateProfile(user.id, { full_name: user.full_name, phone: user.phone });
        setIsEditing(false);
        showMsg('success', 'Cập nhật thông tin thành công!');
        loadProfile(); // reload to confirm saved data
      }
      if (showPasswordForm) {
        if (passwords.new_password !== passwords.confirm_password) {
          showMsg('error', 'Mật khẩu xác nhận không khớp!');
          return;
        }
        if (passwords.new_password.length < 8) {
          showMsg('error', 'Mật khẩu mới phải ít nhất 8 ký tự!');
          return;
        }
        await authApi.changePassword(passwords);
        setShowPasswordForm(false);
        setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        showMsg('success', 'Đổi mật khẩu thành công!');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!';
      showMsg('error', msg);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Cá nhân" showBack={false} />
      {feedback && (
        <div className={`mx-4 mt-2 p-3 rounded-lg text-sm font-medium ${
          feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {feedback.msg}
        </div>
      )}
      <div className="p-4 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <User size={32} />
            </div>
            <div>
              <h2 className="font-bold text-lg">{user.full_name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            {!showPasswordForm && (
              <>
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Họ và tên</label>
                  {isEditing ? (
                    <input 
                      value={user.full_name} 
                      onChange={(e) => setUser({...user, full_name: e.target.value})}
                      className="w-full p-2 border rounded-lg mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-slate-50 rounded-lg">
                      <User size={16} className="text-slate-400" />
                      <span>{user.full_name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Số điện thoại</label>
                  {isEditing ? (
                    <input 
                      value={user.phone} 
                      onChange={(e) => setUser({...user, phone: e.target.value})}
                      className="w-full p-2 border rounded-lg mt-1"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-1 p-2 bg-slate-50 rounded-lg">
                      <Phone size={16} className="text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 font-semibold uppercase">Địa chỉ</label>
                  {isEditing ? (
                    <textarea 
                      value={user.address} 
                      onChange={(e) => setUser({...user, address: e.target.value})}
                      className="w-full p-2 border rounded-lg mt-1"
                    />
                  ) : (
                    <div className="flex items-start gap-2 mt-1 p-2 bg-slate-50 rounded-lg">
                      <MapPin size={16} className="text-slate-400 mt-1" />
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {showPasswordForm && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Đổi mật khẩu</h3>
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">⚠️ Nhập mật khẩu hiện tại thật của tài khoản. Mật khẩu mới cần tối thiểu 8 ký tự.</p>
                <input 
                  type="password"
                  placeholder="Mật khẩu cũ"
                  value={passwords.current_password} 
                  onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
                <input 
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={passwords.new_password} 
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
                <input 
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={passwords.confirm_password} 
                  onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="pt-4 space-y-2">
            {isEditing || showPasswordForm ? (
              <Button onClick={handleSave} className="w-full" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thông tin'}</Button>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="secondary" className="w-full">Chỉnh sửa</Button>
                <Button onClick={() => setShowPasswordForm(true)} variant="secondary" className="w-full">Đổi mật khẩu</Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Profile;

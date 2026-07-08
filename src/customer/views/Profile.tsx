import { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export function Profile({ onBack }: { onBack: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM'
  });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSave = () => {
    if (isEditing) {
      setIsEditing(false);
    }
    if (showPasswordForm) {
      setShowPasswordForm(false);
      setPasswords({ old: '', new: '', confirm: '' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Cá nhân" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <User size={32} />
            </div>
            <div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            {!showPasswordForm && (
              <>
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
                <input 
                  type="password"
                  placeholder="Mật khẩu cũ"
                  value={passwords.old} 
                  onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
                <input 
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={passwords.new} 
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
                <input 
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={passwords.confirm} 
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="pt-4 space-y-2">
            {isEditing || showPasswordForm ? (
              <Button onClick={handleSave} className="w-full">Lưu thông tin</Button>
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

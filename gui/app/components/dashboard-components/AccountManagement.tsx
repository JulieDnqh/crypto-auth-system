"use client";

import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { useState, useEffect } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string; // Có thể có hoặc không
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
}

type EditableProfileFields = Omit<UserData, 'id' | 'email' | 'role'>;

// Định nghĩa props cho component
interface AccountManagementProps {
  currentUser: UserData;
  onProfileUpdate: () => void;
}

export default function AccountManagement({ currentUser, onProfileUpdate }: AccountManagementProps) {
  
  const [editableProfile, setEditableProfile] = useState<Partial<EditableProfileFields>>({});
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: ""});
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: ""});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch dữ liệu profile ban đầu
  // Điền dữ liệu vào form khi component được tải hoặc khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      const formattedBirthDate = currentUser.birthDate 
        ? new Date(currentUser.birthDate).toISOString().split('T')[0] 
        : "";
      
      setEditableProfile({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        birthDate: formattedBirthDate,
        phone: currentUser.phone || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]); // Dependency là currentUser, khi nó thay đổi, form sẽ cập nhật
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileMessage({ type: "", text: "" });

    // So sánh để chỉ gửi những trường đã thay đổi
    const changes: Partial<EditableProfileFields> = {};
    (Object.keys(editableProfile) as Array<keyof EditableProfileFields>).forEach(key => {
      // Luôn so sánh với `currentUser` là dữ liệu gốc mới nhất
      let originalValue: string | undefined;
      if (key === 'birthDate') {
        originalValue = currentUser.birthDate ? new Date(currentUser.birthDate).toISOString().split('T')[0] : "";
      } else {
        originalValue = currentUser[key as keyof UserData];
      }

      if (editableProfile[key] !== (originalValue || '')) {
        changes[key] = editableProfile[key];
      }
    });

    if (Object.keys(changes).length === 0) {
      setProfileMessage({ type: "info", text: "No changes to update." });
      setLoadingProfile(false);
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(changes),
      });

      const data = await response.json();
      if (response.ok) {
        setProfileMessage({ type: 'success', text: data.message });
        setEditableProfile(prev => ({...prev, ...changes}));
        // onProfileUpdate(); // Báo cho component cha để fetch lại dữ liệu mới nhất
      } else {
        setProfileMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setLoadingProfile(false);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordMessage({ type: "", text: "" });
      
      if (passwords.newPassword !== passwords.confirmNewPassword) {
        setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
        return;
    }

    setLoadingPassword(true);
  };

  // Nếu chưa có dữ liệu để điền vào form, hiển thị loading
  // if (!originalProfile) {
  //   return <div>Loading profile data...</div>;
  // }

  return (
    <div className="space-y-8">
      {/* Form 1: Cập nhật thông tin cá nhân */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-[#001C44] mb-4">Update Profile Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Các ô input cho firstName, lastName, birthDate, ... */}
          {/* Các ô input sẽ dùng editableProfile */}
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-[#001C44]">First Name</Label>
            <Input 
              id="firstName"
              name="firstName"
              value={editableProfile.firstName || ''}
              onChange={handleProfileChange}
              className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44] rounded-md border-gray-300" 
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-[#001C44]">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={editableProfile.lastName || ''}
              onChange={handleProfileChange}
              className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44] rounded-md border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="birthDate" className="text-sm font-medium text-[#001C44]">Date of Birth</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={editableProfile.birthDate || ''}
              onChange={handleProfileChange}
              className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44] rounded-md border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-[#001C44]">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={editableProfile.phone || ''}
              onChange={handleProfileChange}
              className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44] rounded-md border-gray-300"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address" className="text-sm font-medium text-[#001C44]">Address</Label>
            <Input
              id="address"
              name="address"
              value={editableProfile.address || ''}
              onChange={handleProfileChange}
              className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44] rounded-md border-gray-300"
            />
          </div>

          <div className="md:col-span-2">
            <Button 
              type="submit" 
              disabled={loadingProfile}
              className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loadingProfile ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                "Update Profile"
              )}
            </Button>
            {profileMessage.text && <p className={profileMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}>{profileMessage.text}</p>}
          </div>
        </form>
      </div>

      {/* Form 2: Thay đổi mật khẩu/passphrase */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-[#001C44] mb-4">Change Password</h3>
        <p className="text-sm text-gray-500 mb-4">Changing your password will re-encrypt your RSA private key for security.</p>
        <form 
          onSubmit={handleChangePassword} 
          className="space-y-4"
        >
          {/* Ô Old Password */}
          <div>
            <Label 
              htmlFor="oldPassword" 
              className="text-sm font-medium text-[#001C44]"
            >
              Old Password
            </Label>
            <div className="relative mt-1">
              <Input 
                id="oldPassword" 
                name="oldPassword" 
                type={showOldPassword ? "text" : "password"}
                className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44]"
                placeholder="Enter your current password"
                value={passwords.oldPassword}
                // Cập nhật đúng trường 'oldPassword' trong state
                onChange={(e) => setPasswords(prev => ({ ...prev, oldPassword: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showOldPassword ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Ô New Password */}
          <div>
            <Label 
              htmlFor="newPassword"
              className="text-sm font-medium text-[#001C44]"
            >
              New Password
            </Label>
            <div className="relative mt-1">
              <Input 
                id="newPassword" 
                name="newPassword" 
                type="password"
                className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44]"
                placeholder="Enter your new password (at least 8 characters)"
                value={passwords.newPassword}
                // Cập nhật đúng trường 'newPassword' trong state
                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showNewPassword ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-[#001C44]">Confirm New Password</Label>
            <div className="relative mt-1">
              <Input 
                id="confirmNewPassword" 
                name="confirmNewPassword" 
                type={showConfirmPassword ? "text" : "password"}
                className="mt-1 w-full bg-[#F3F4F6] placeholder-[#9095A1] text-[#001C44]"
                placeholder="Re-enter your new password"
                value={passwords.confirmNewPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showConfirmPassword ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Nút Change Password */}
          <Button 
            type="submit" 
            disabled={loadingPassword}
            className="w-full bg-[#2D99AE] hover:bg-[#0C5776] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loadingPassword ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              "Change Password"
            )}
          </Button>
          
          {/* Thông báo thành công hoặc lỗi */}
          {passwordMessage.text && (
            <p className={`text-sm text-center ${
                passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {passwordMessage.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
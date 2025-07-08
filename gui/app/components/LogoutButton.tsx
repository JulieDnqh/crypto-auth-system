"use client";

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Xóa token khỏi localStorage
    router.push('/signin'); // Chuyển hướng về trang đăng nhập
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#2D99AE] rounded-md hover:bg-[#0C5776] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </button>
  );
};

export default LogoutButton;

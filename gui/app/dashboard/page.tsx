"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, User, Key, FileText, Settings, Shield } from "lucide-react";
import useAuth from "../../lib/hooks/useAuth"; // Import useAuth
import LogoutButton from "../../components/LogoutButton"; // Import LogoutButton

const Sidebar = ({ isAdmin = false }) => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const commonFeatures = [
    {
      name: "Quản lý tài khoản",
      icon: <User className="w-5 h-5" />,
      items: [
        { label: "Cập nhật thông tin tài khoản", href: "#" },
        { label: "Khôi phục tài khoản", href: "#" },
      ],
    },
    {
      name: "Quản lý khoá",
      icon: <Key className="w-5 h-5" />,
      items: [
        { label: "Quản lý khoá RSA cá nhân", href: "#" },
        { label: "QR Code Public Key", href: "#" },
        { label: "Tìm kiếm public key", href: "#" },
      ],
    },
    {
      name: "Xử lý tập tin",
      icon: <FileText className="w-5 h-5" />,
      items: [
        { label: "Mã hoá tập tin gửi người khác", href: "#" },
        { label: "Giải mã tập tin", href: "#" },
        { label: "Ký số tập tin", href: "#" },
        { label: "Xác minh chữ ký", href: "#" },
      ],
    },
  ];

  const adminFeatures = [
    {
      name: "Tính năng Admin",
      icon: <Shield className="w-5 h-5" />,
      items: [
        { label: "Phân quyền tài khoản", href: "#" },
        { label: "Ghi log bảo mật", href: "#" },
        { label: "Kiểm tra trạng thái khoá", href: "#" },
        { label: "Giới hạn đăng nhập", href: "#" },
      ],
    },
  ];

  const menuItems = isAdmin ? [...commonFeatures, ...adminFeatures] : commonFeatures;

  return (
    <div className="w-64 bg-[#0C5776] text-white p-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
      <nav>
        <ul>
          {menuItems.map((menu) => (
            <li key={menu.name} className="mb-2">
              <button
                onClick={() => toggleMenu(menu.name)}
                className="flex items-center justify-between w-full p-2 rounded-md hover:bg-[#2D99AE] focus:outline-none"
              >
                <span className="flex items-center">
                  {menu.icon}
                  <span className="ml-3">{menu.name}</span>
                </span>
                {openMenus[menu.name] ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openMenus[menu.name] && (
                <ul className="ml-6 mt-1 space-y-1">
                  {menu.items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="block p-2 rounded-md hover:bg-[#2D99AE]">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

import { useEffect } from 'react';

export default function DashboardPage() {
  useAuth(); // Áp dụng hook bảo vệ route
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data.user); // Backend trả về { message, user }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isAdmin={false} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#001C44]">User Dashboard</h1>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#001C44] mb-4">Welcome, {userData ? userData.firstName : 'User'}!</h2>
            {loading && <p>Loading user data...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {userData && (
              <div className="text-gray-700">
                <p>Email: {userData.email}</p>
                <p>Role: {userData.role}</p>
                {/* Display other user data as needed */}
              </div>
            )}
            <p className="text-gray-700 mt-4">This is your personalized dashboard. Use the sidebar to navigate through features.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

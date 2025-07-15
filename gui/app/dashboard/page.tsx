// File: gui/app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import useAuth from "@/lib/hooks/useAuth";
import LogoutButton from "@/app/components/LogoutButton";
import { Sidebar } from "@/app/components/dashboard-components/Sidebar";
import { featureComponents } from "@/lib/dashboardFeatures";
import DashboardSwitcherButton from "@/app/components/DashboardSwitcherButton";

// Định nghĩa kiểu cho dữ liệu người dùng
interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;  // Thêm trường lastName
  birthDate?: string; // Thêm các trường tùy chọn
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
}

export default function DashboardPage() {
  useAuth(); // Hook bảo vệ route

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedFeaturePath = searchParams.get('feature');

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('jwtToken'); // Đổi tên token cho đúng
    if (!token) {
      setLoading(false);
      router.push('/signin'); // Quay về trang đăng nhập nếu không có token
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) localStorage.removeItem('jwtToken'); // Xóa token hỏng
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("✅ Dữ liệu 'user' nhận được từ backend:", data.user); // LOG 6

      setUserData(data.user);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to load user data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch dữ liệu người dùng
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        fetchProfile();
    } else {
        router.push('/signin'); // Chuyển hướng nếu không có token ngay từ đầu
    }
  }, [fetchProfile, router]);

  // Hàm được gọi khi nhấn vào một item trong sidebar
  const handleItemClick = (path: string) => {
    router.push(`${pathname}?feature=${path}`);
  };

  // Hàm quyết định render component nào ở phần main
  const renderFeatureComponent = () => {
    // Nếu có feature được chọn trong URL và nó tồn tại trong map
    if (selectedFeaturePath && featureComponents[selectedFeaturePath]) {
      const ComponentToRender = featureComponents[selectedFeaturePath];

      // Nếu component cần dữ liệu người dùng (ví dụ: AccountManagement)
      if (selectedFeaturePath === 'account-management') {
          // Chỉ render khi đã có userData, nếu không sẽ bị lỗi
          if (userData) {
              return <ComponentToRender currentUser={userData} />;
          }
          // Nếu chưa có userData (đang loading hoặc lỗi), hiển thị thông báo
          return <div>Loading user data for this feature...</div>;
      }

      return <ComponentToRender />;
    }

    // Nếu không, hiển thị màn hình chào mừng
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#001C44] mb-4">
          Welcome, {userData ? userData.firstName : 'User'}!
        </h2>
        {userData && (
          <div className="text-gray-700">
            <p>Email: {userData.email}</p>
            <p>Role: {userData.role}</p>
          </div>
        )}
        <p className="text-gray-700 mt-4">This is your personalized dashboard. Use the sidebar to navigate through features.</p>
      </div>
    );
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>;
  }
  
  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isAdmin={userData?.role === 'admin'} 
        onItemClick={handleItemClick}
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#001C44]">User Dashboard</h1>
          <div className="flex items-center">
            {userData?.role === 'ADMIN' && (
              <DashboardSwitcherButton currentRole={userData.role} targetDashboard="admin" />
            )}
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {renderFeatureComponent()}
        </main>
      </div>
    </div>
  );
}
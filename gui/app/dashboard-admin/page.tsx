"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import useAuth from "@/lib/hooks/useAuth";
import LogoutButton from "@/app/components/LogoutButton";
import { Sidebar } from "@/app/components/dashboard-components/Sidebar";
import { featureComponents } from "@/lib/dashboardFeatures";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  role: 'user' | 'admin';
}

export default function DashboardAdminPage() {
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

  const handleItemClick = (path: string) => {
    router.push(`${pathname}?feature=${path}`);
  };

  const renderFeatureComponent = () => {
    if (selectedFeaturePath && featureComponents[selectedFeaturePath]) {
      const ComponentToRender = featureComponents[selectedFeaturePath];
      return <ComponentToRender />;
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#001C44] mb-4">Welcome, {userData ? userData.firstName : 'Admin'}!</h2>
        {/* ... */}
      </div>
    );
  };

  if (loading) { return <div>Loading...</div>; }
  if (error) { return <div>Error: {error}</div>; }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isAdmin={true} 
        onItemClick={handleItemClick}
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#001C44]">Admin Dashboard</h1>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {renderFeatureComponent()}
        </main>
      </div>
    </div>
  );

}

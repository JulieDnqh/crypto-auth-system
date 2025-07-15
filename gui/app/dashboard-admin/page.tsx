"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import useAuth from "@/lib/hooks/useAuth";
import LogoutButton from "@/app/components/LogoutButton";
import { Sidebar } from "@/app/components/dashboard-components/Sidebar";
import { featureComponents, adminFeaturesConfig } from "@/lib/dashboardFeatures"; // Import adminFeaturesConfig
import DashboardSwitcherButton from "@/app/components/DashboardSwitcherButton"; // Import the new component

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
    // Get all valid admin feature paths
    const adminFeaturePaths = adminFeaturesConfig.flatMap(menu => menu.items.map(item => item.path));

    // Determine which feature to render
    let featureToRenderPath = selectedFeaturePath;

    // If selectedFeaturePath is not valid or not an admin feature, default to the first admin feature
    if (!featureToRenderPath || !adminFeaturePaths.includes(featureToRenderPath)) {
      featureToRenderPath = adminFeaturePaths[0]; // Default to the first admin feature
    }

    if (featureToRenderPath && featureComponents[featureToRenderPath]) {
      const ComponentToRender = featureComponents[featureToRenderPath];
      return <ComponentToRender />;
    }

    // Fallback if no component can be rendered (should ideally not happen with proper config)
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#001C44] mb-4">Welcome, {userData ? userData.firstName : 'Admin'}!</h2>
        <p>Please select a feature from the sidebar.</p>
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
        adminView={true}
      />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#001C44]">Admin Dashboard</h1>
          <div className="flex items-center">
            {userData?.role === 'ADMIN' && (
              <DashboardSwitcherButton currentRole={userData.role} targetDashboard="user" />
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

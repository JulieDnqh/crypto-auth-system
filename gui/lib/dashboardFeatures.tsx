// File: gui/lib/dashboardFeatures.ts

import { User, Key, FileText, Shield } from "lucide-react";

// Import các component tính năng của bạn
import RSAPersonalKeyManagement from "@/app/components/dashboard-components/KeyManagement";
// import AccountManagement from "@/app/components/dashboard-components/AccountManagement";
// ... import các component khác ...

// --- ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU ---
export interface FeatureItem {
  key: string;
  label: string;
  path: string; // Đường dẫn dùng trong URL
}

export interface FeatureMenu {
  name: string;
  key: string;
  icon: React.ReactNode;
  items: FeatureItem[];
}

// --- ĐỊNH NGHĨA CÁC MENU ---
export const commonFeaturesConfig: FeatureMenu[] = [
  {
    name: "Quản lý tài khoản",
    key: "account",
    icon: <User className="w-5 h-5" />,
    items: [
      { key: "acc-update", label: "Cập nhật thông tin", path: "account-management" },
      { key: "acc-recover", label: "Khôi phục tài khoản", path: "account-recovery" },
    ],
  },
  {
    name: "Quản lý khoá",
    key: "keys",
    icon: <Key className="w-5 h-5" />,
    items: [
      { key: "rsa-personal", label: "Quản lý khoá RSA cá nhân", path: "rsa-personal-key" },
      { key: "qr-public", label: "QR Code Public Key", path: "qr-public-key" },
      { key: "search-public", label: "Tìm kiếm public key", path: "search-public-key" },
    ],
  },
  // ... các menu khác
];

export const adminFeaturesConfig: FeatureMenu[] = [
  // ... định nghĩa các menu của admin ở đây
];


// --- MAP ĐƯỜNG DẪN VỚI COMPONENT TƯƠNG ỨNG ---
// Kiểu dữ liệu cho map này
type FeatureComponentMap = {
  [key: string]: React.ComponentType<any>;
};

// Object map
export const featureComponents: FeatureComponentMap = {
  "rsa-personal-key": RSAPersonalKeyManagement,
  // "account-management": AccountManagement,
  // ... thêm các component khác vào đây
};
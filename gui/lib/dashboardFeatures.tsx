// File: gui/lib/dashboardFeatures.ts

import { User, Key, FileText, Shield } from "lucide-react";

// Import các component tính năng
import FileProcessing from "@/app/components/dashboard-components/FileProcessing";
import RSAPersonalKeyManagement from "@/app/components/dashboard-components/KeyManagement";
import AccountManagement from "@/app/components/dashboard-components/AccountManagement";
import SearchPublicKey from "@/app/components/dashboard-components/SearchPublicKey";
import QRCodeGenerator from "@/app/components/dashboard-components/QRCodeGenerator";

// Định nghĩa cấu trúc dữ liệu
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

// Định nghĩa các menu
export const commonFeaturesConfig: FeatureMenu[] = [
  {
    name: "Account Management",
    key: "account",
    icon: <User className="w-5 h-5" />,
    items: [
      { key: "acc-update", label: "Update Account Information", path: "account-management" },
      { key: "acc-recover", label: "Account Recovery", path: "account-recovery" },
    ],
  },
  {
    name: "Key Management",
    key: "keys",
    icon: <Key className="w-5 h-5" />,
    items: [
      { key: "rsa-personal", label: "Personal RSA Key", path: "rsa-personal-key" },
      { key: "qr-public", label: "QR Code Public Key", path: "qr-code-generator" },
      { key: "search-public", label: "Tìm kiếm public key", path: "search-public-key" },
    ],
  },
];

export const adminFeaturesConfig: FeatureMenu[] = [
    {
      name: "Quản trị hệ thống",
      key: "admin",
      icon: <Shield className="w-5 h-5" />,
      items: [
        { key: "admin-roles", label: "Phân quyền tài khoản", path: "manage-roles" },
        { key: "admin-logs", label: "Ghi log bảo mật", path: "view-logs" },
        // Thêm mục tìm kiếm
        // { key: "admin-search", label: "Tìm kiếm public key", path: "search-public-key" },
      ],
    },
];

// Map đường dẫn với component tương ứng
type FeatureComponentMap = {
  [key: string]: React.ComponentType<any>;
};

export const featureComponents: FeatureComponentMap = {
  "rsa-personal-key": RSAPersonalKeyManagement,
  "account-management": AccountManagement,
  "search-public-key": SearchPublicKey,
   "qr-code-generator": QRCodeGenerator,
};
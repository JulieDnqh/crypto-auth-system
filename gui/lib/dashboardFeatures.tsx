// File: gui/lib/dashboardFeatures.ts

import { User, Key, FileText, Shield } from "lucide-react";

// Import your feature components
import KeyManagement from "@/app/components/dashboard-components/KeyManagement";

import AccountManagement from "@/app/components/dashboard-components/AccountManagement";
import SearchPublicKey from "@/app/components/dashboard-components/SearchPublicKey";
import QRCodeGenerator from "@/app/components/dashboard-components/QRCodeGenerator"; // Import the new component
import AdminLogs from "@/app/components/dashboard-components/AdminLogs"; // Import AdminLogs

// --- DATA STRUCTURE DEFINITIONS ---
export interface FeatureItem {
  key: string;
  label: string;
  path: string; // Path used in URL
}

export interface FeatureMenu {
  name: string;
  key: string;
  icon: React.ReactNode;
  items: FeatureItem[];
}

// --- MENU DEFINITIONS ---
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
      { key: "search-public", label: "Search Public Key", path: "search-public-key" },
    ],
  },
  // ... other menus
];

export const adminFeaturesConfig: FeatureMenu[] = [
    {
      name: "System Administration",
      key: "admin",
      icon: <Shield className="w-5 h-5" />,
      items: [
        { key: "admin-users", label: "User Management", path: "admin-account-management" },
        { key: "admin-logs", label: "View Activity Logs", path: "admin-view-logs" },
      ],
    },
];


// --- MAP ĐƯỜNG DẪN VỚI COMPONENT TƯƠNG ỨNG ---
// Kiểu dữ liệu cho map này
type FeatureComponentMap = {
  [key: string]: React.ComponentType<any>;
};

// Object map
export const featureComponents: FeatureComponentMap = {
  "rsa-personal-key": KeyManagement,
  "account-management": AccountManagement,
  "search-public-key": SearchPublicKey,
  "qr-code-generator": QRCodeGenerator,
  "admin-account-management": AccountManagement, // Re-use for admin account management
  "admin-view-logs": AdminLogs,
};
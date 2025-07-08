// File: gui/app/components/dashboard-components/Sidebar.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { commonFeaturesConfig, adminFeaturesConfig, FeatureMenu } from "@/lib/dashboardFeatures";

// Định nghĩa props cho Sidebar
interface SidebarProps {
  isAdmin: boolean;
  onItemClick: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin, onItemClick }) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();
  const currentFeaturePath = searchParams.get('feature');

  const toggleMenu = (menuKey: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const menuItems: FeatureMenu[] = isAdmin 
    ? [...commonFeaturesConfig, ...adminFeaturesConfig] 
    : commonFeaturesConfig;

  return (
    <div className="w-64 bg-[#0C5776] text-white p-4 flex flex-col h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((menu) => (
            <li key={menu.key} className="mb-2">
              <button
                onClick={() => toggleMenu(menu.key)}
                className="flex items-center justify-between w-full p-2 rounded-md hover:bg-[#2D99AE] focus:outline-none"
              >
                <span className="flex items-center">
                  {menu.icon}
                  <span className="ml-3">{menu.name}</span>
                </span>
                {openMenus[menu.key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openMenus[menu.key] && (
                <ul className="ml-6 mt-1 space-y-1">
                  {menu.items.map((item) => (
                    <li key={item.key}>
                      <button
                        onClick={() => onItemClick(item.path)}
                        className={`block w-full text-left p-2 rounded-md ${
                          currentFeaturePath === item.path ? 'bg-[#2D99AE] font-bold' : 'hover:bg-[#2D99AE]'
                        }`}
                      >
                        {item.label}
                      </button>
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
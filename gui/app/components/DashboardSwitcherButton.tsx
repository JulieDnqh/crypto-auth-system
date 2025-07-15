"use client";

import Link from 'next/link';
import { Button } from "./button";

interface DashboardSwitcherButtonProps {
  currentRole: string;
  targetDashboard: 'user' | 'admin';
}

const DashboardSwitcherButton: React.FC<DashboardSwitcherButtonProps> = ({
  currentRole,
  targetDashboard,
}) => {
  if (currentRole !== 'ADMIN') {
    return null; // Only show button if user is ADMIN
  }

  const isCurrentUserDashboard = targetDashboard === 'user';
  const linkHref = isCurrentUserDashboard ? '/dashboard' : '/dashboard-admin';
  const buttonText = isCurrentUserDashboard ? 'Go to User Dashboard' : 'Go to Admin Dashboard';

  return (
    <Link href={linkHref} passHref>
      <Button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mr-2">
        {buttonText}
      </Button>
    </Link>
  );
};

export default DashboardSwitcherButton;

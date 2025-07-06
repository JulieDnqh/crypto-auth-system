'use client';

import React, { useState } from 'react';
import { Home, Users, ScrollText, Settings, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DropdownItem = ({ icon: Icon, text, onClick }) => (
  <li className="mb-2 ml-4">
    <a
      href="#"
      onClick={onClick}
      className="flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors duration-200"
    >
      <Icon className="mr-3" size={18} />
      {text}
    </a>
  </li>
);

const DropdownMenu = ({ title, icon: Icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors duration-200 focus:outline-none"
      >
        <span className="flex items-center">
          <Icon className="mr-3" size={20} />
          {title}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <ul className="mt-2">{children}</ul>}
    </li>
  );
};

const AdminPage = () => {
  const [activeContent, setActiveContent] = useState('overview');
  const router = useRouter();

  const renderContent = () => {
    switch (activeContent) {
      case 'overview':
        return (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Admin Dashboard!</h2>
            <p className="text-lg text-gray-600">Select an option from the sidebar to manage the system.</p>
          </div>
        );
      case 'user_list':
        return (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">User List</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">[Table or list of all registered users]</p>
            </div>
          </section>
        );
      case 'lock_unlock_account':
        return (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lock/Unlock Account</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">[Form to search and lock/unlock user accounts]</p>
            </div>
          </section>
        );
      case 'system_logs':
        return (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">System Logs</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">[Table or list of all system activities and security logs]</p>
            </div>
          </section>
        );
      case 'admin_settings':
        return (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">[General settings for admin panel]</p>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 shadow-md">
        <div className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</div>
        <nav>
          <ul>
            <li className="mb-4">
              <a
                href="#"
                onClick={() => setActiveContent('overview')}
                className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors duration-200"
              >
                <Home className="mr-3" size={20} />
                Overview
              </a>
            </li>

            <DropdownMenu title="User Management" icon={Users}>
              <DropdownItem icon={Users} text="User List" onClick={() => setActiveContent('user_list')} />
              <DropdownItem icon={Lock} text="Lock/Unlock Account" onClick={() => setActiveContent('lock_unlock_account')} />
            </DropdownMenu>

            <DropdownMenu title="System Logs" icon={ScrollText}>
              <DropdownItem icon={ScrollText} text="View System Logs" onClick={() => setActiveContent('system_logs')} />
            </DropdownMenu>

            <li className="mb-4">
              <a
                href="#"
                onClick={() => setActiveContent('admin_settings')}
                className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors duration-200"
              >
                <Settings className="mr-3" size={20} />
                Settings
              </a>
            </li>

            {/* Link back to User Dashboard */}
            <li className="mb-4 mt-8 pt-4 border-t border-gray-200">
              <a
                href="#"
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors duration-200"
              >
                <Home className="mr-3" size={20} />
                Back to User Dashboard
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPage;

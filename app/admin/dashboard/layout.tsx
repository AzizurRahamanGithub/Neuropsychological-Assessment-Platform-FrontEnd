'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  const navItems = [
    // {
    //   label: 'Dashboard',
    //   href: '/admin/dashboard',
    //   icon: LayoutDashboard,
    // },
    {
      label: 'Patients',
      href: '/admin/dashboard/patients',
      icon: Users,
    },
    {
      label: 'Questionnaires',
      href: '/admin/dashboard/questionnaires',
      icon: ClipboardList,
    },
    {
      label: 'Results',
      href: '/admin/dashboard/results',
      icon: BarChart3,
    },
    // {
    //   label: 'Settings',
    //   href: '/admin/dashboard/settings',
    //   icon: Settings,
    // },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">NeuroPsych</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Clinician Dashboard
            </h2>
            <div className="text-sm text-gray-600">
              Welcome back!
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

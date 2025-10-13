"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import Avatar from './Avatar';

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number;
}

export interface SidebarProps {
  user?: {
    id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  items: SidebarItem[];
  onLogout?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  items,
  onLogout,
  className,
}) => {
  const pathname = usePathname();

  const HomeIcon = ({ active }: { active: boolean }) => (
    <svg
      className={cn(
        "w-6 h-6 transition-colors duration-200",
        active ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
      )}
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={active ? 0 : 2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );

  const SearchIcon = ({ active }: { active: boolean }) => (
    <svg
      className={cn(
        "w-6 h-6 transition-colors duration-200",
        active ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const MessagesIcon = ({ active }: { active: boolean }) => (
    <svg
      className={cn(
        "w-6 h-6 transition-colors duration-200",
        active ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );

  const NotificationsIcon = ({ active }: { active: boolean }) => (
    <svg
      className={cn(
        "w-6 h-6 transition-colors duration-200",
        active ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );

  const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg
      className={cn(
        "w-6 h-6 transition-colors duration-200",
        active ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const CreateIcon = () => (
    <svg
      className="w-6 h-6 text-gray-600 dark:text-gray-400 dark:text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  const MoreIcon = () => (
    <svg
      className="w-6 h-6 text-gray-600 dark:text-gray-400 dark:text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );

  const defaultItems: SidebarItem[] = [
    {
      href: '/',
      label: 'Inicio',
      icon: <HomeIcon active={pathname === '/'} />,
    },
    {
      href: '/explore',
      label: 'Explorar',
      icon: <SearchIcon active={pathname === '/explore'} />,
    },
    {
      href: '/messages',
      label: 'Mensajes',
      icon: <MessagesIcon active={pathname === '/messages'} />,
    },
    {
      href: '/notifications',
      label: 'Notificaciones',
      icon: <NotificationsIcon active={pathname === '/notifications'} />,
    },
    {
      href: '/profile',
      label: 'Perfil',
      icon: <ProfileIcon active={pathname === '/profile'} />,
    },
  ];

  const sidebarItems = items.length > 0 ? items : defaultItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 z-40",
        className
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">CircleSfera</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:bg-gray-800"
                )}
              >
                <div className="flex items-center space-x-3">
                  {isActive ? item.activeIcon || item.icon : item.icon}
                  <span className={cn(
                    "font-medium text-sm transition-colors duration-200",
                    isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:text-gray-100"
                  )}>
                    {item.label}
                  </span>
                </div>
                
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Create Button */}
        <div className="px-4 pb-4">
          <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            <CreateIcon />
            <span className="ml-2">Crear</span>
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
              <Avatar
                src={user.avatar}
                alt={user.username}
                size="sm"
                fallback={user.fullName || user.username}
                interactive
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">
                  {user.fullName}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-1 hover:bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <MoreIcon />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {sidebarItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 relative",
                  isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
                )}
              >
                <div className="relative">
                  {isActive ? item.activeIcon || item.icon : item.icon}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Profile link */}
          {user && (
            <Link
              href="/profile"
              className={cn(
                "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200",
                pathname === '/profile' ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
              )}
            >
              <Avatar
                src={user.avatar}
                alt={user.username}
                size="xs"
                fallback={user.fullName || user.username}
                interactive
              />
              <span className="text-xs font-medium">Perfil</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

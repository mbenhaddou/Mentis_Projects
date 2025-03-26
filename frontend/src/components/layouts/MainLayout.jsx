import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ToastProvider } from '@/components/ui/toast';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  ListTodo,
  BarChart,
  Users,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Define which roles can access the Analytics page
  const canAccessAnalytics = user?.role === 'Admin' || user?.role === 'Manager';

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      title: 'Projects',
      icon: <ListTodo className="h-5 w-5" />,
      path: '/projects',
    },
    {
      title: 'My Tasks',
      icon: <Calendar className="h-5 w-5" />,
      path: '/tasks',
    },
    // Only show Analytics to Admin and Manager roles
    ...(canAccessAnalytics ? [{
      title: 'Analytics',
      icon: <BarChart className="h-5 w-5" />,
      path: '/analytics',
    }] : []),
    {
      title: 'Team',
      icon: <Users className="h-5 w-5" />,
      path: '/team',
    },
    // User Management menu item (only for Admin users)
    ...(user?.role === 'Admin' ? [{
      title: 'User Management',
      icon: <Users className="h-5 w-5" />,
      path: '/users',
    }] : []),
  ];

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Mobile sidebar toggle */}
        <button
          className="fixed z-50 p-2 bg-white rounded-md shadow-md lg:hidden top-4 left-4"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-semibold">
                M
              </div>
              <h1 className="text-xl font-bold">Mentis</h1>
            </div>
            <button
              className="p-1 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-md ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-8 mt-8 border-t border-gray-200">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="ml-3">Settings</span>
              </NavLink>

              <Button
                variant="ghost"
                className="flex items-center w-full px-4 py-3 mt-2 text-left text-gray-700 rounded-md hover:bg-gray-100"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top header */}
          <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
            <div className="text-xl font-semibold">
              {/* You can add page title here dynamically */}
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 rounded-full">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>
                          {user && user.name ? user.name.charAt(0) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default MainLayout;
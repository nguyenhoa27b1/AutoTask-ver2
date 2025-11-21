import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Award, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';

export const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/user/tasks', icon: CheckSquare },
    { name: 'My Score', href: '/user/profile', icon: Award },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (user?.role !== Role.USER) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="text-xl font-bold text-blue-600">AutoTask</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <span className="text-xl font-bold text-blue-600">AutoTask</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User score display */}
          <div className="p-4 border-t">
            <div className="px-4 py-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="text-2xl font-bold text-blue-600">{user?.score || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b lg:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
              <p className="text-xs text-gray-500">Score: {user?.score || 0}</p>
            </div>
            {user?.avatar && (
              <img src={user.avatar} alt={user.name || ''} className="w-10 h-10 rounded-full" />
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

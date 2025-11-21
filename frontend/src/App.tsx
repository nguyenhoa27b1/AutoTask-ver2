import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import { UserLayout } from './components/layout/UserLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TasksManagement } from './pages/admin/TasksManagement';
import { CreateTask } from './pages/admin/CreateTask';
import { AdminTaskDetail } from './pages/admin/AdminTaskDetail';
import { UsersManagement } from './pages/admin/UsersManagement';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { UserTaskDetail } from './pages/user/UserTaskDetail';

import { Loading } from './components/common/Loading';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'ADMIN' | 'USER' }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        initAuth();
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        // Delay để thấy được loading
        setTimeout(() => setIsInitializing(false), 100);
      }
    };
    init();
  }, [initAuth]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tasks" element={<TasksManagement />} />
              <Route path="tasks/create" element={<CreateTask />} />
              <Route path="tasks/:id" element={<AdminTaskDetail />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            {/* User Routes */}
            <Route
              path="/user/*"
              element={
                <ProtectedRoute requiredRole="USER">
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="tasks/:id" element={<UserTaskDetail />} />
              <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

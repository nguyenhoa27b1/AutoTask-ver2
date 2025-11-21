import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { Role } from '../../types';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === Role.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received');
      }

      const { user, token } = await authService.loginWithGoogle(credentialResponse.credential);
      
      setAuth(user, token);
      toast.success(`Welcome ${user.name || user.email}!`);

      // Redirect based on role
      if (user.role === Role.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AutoTask</h1>
            <p className="text-gray-600">Task Management System</p>
          </div>

          {/* Description */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 text-center">
              Sign in with your Google account to access your tasks and manage your work efficiently.
            </p>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-2xl font-bold text-blue-600">Admin</p>
            <p className="text-xs text-gray-600 mt-1">Manage & Score Tasks</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-2xl font-bold text-green-600">User</p>
            <p className="text-xs text-gray-600 mt-1">Complete & Track Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

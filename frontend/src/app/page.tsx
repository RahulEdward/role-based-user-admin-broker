'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, User, Shield, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/landing');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5" />;
      case 'broker':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'broker':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Stock Market Auth
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user.role)}
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Stock Market Auth
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    User Information
                  </h2>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Username</dt>
                      <dd className="text-sm text-gray-900">{user.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="text-sm text-gray-900 capitalize">{user.role}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">
                        {user.is_active ? 'Active' : 'Inactive'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Available Actions
                  </h2>
                  <div className="space-y-3">
                    {user.role === 'admin' && (
                      <>
                        <p className="text-sm text-gray-600">
                          • Access admin panel<br/>
                          • Manage users<br/>
                          • System configuration
                        </p>
                        <button
                          onClick={() => router.push('/admin')}
                          className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                        >
                          Admin Dashboard
                        </button>
                      </>
                    )}
                    {(user.role === 'broker' || user.role === 'user') && (
                      <>
                        <p className="text-sm text-gray-600">
                          • Connect to Angel Broker<br/>
                          • View portfolio<br/>
                          • Place orders<br/>
                          • Access market data
                        </p>
                        <div className="space-y-2">
                          {!user.is_2fa_enabled && (
                            <button
                              onClick={() => router.push('/setup-2fa')}
                              className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                            >
                              Setup 2FA (Required)
                            </button>
                          )}
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                          >
                            Go to Dashboard
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
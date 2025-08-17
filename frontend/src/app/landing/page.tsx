'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, Shield, Users, BarChart3, Lock, Zap } from 'lucide-react';

export default function Landing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Stock Market Auth
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Stock Market
            <span className="text-blue-600"> Authentication</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional role-based authentication system with Angel Broker integration, 
            2FA security, and comprehensive user management for stock market applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Start Trading Now
            </button>
            <button
              onClick={() => router.push('/login')}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Login to Account
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Built for traders, by traders. Security and performance first.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bank-Level Security
              </h3>
              <p className="text-gray-600">
                2FA authentication, encrypted API keys, and role-based access control
              </p>
            </div>
            
            <div className="text-center p-6">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Angel Broker Integration
              </h3>
              <p className="text-gray-600">
                Direct integration with Angel Broker API for seamless trading
              </p>
            </div>
            
            <div className="text-center p-6">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Role-Based Access
              </h3>
              <p className="text-gray-600">
                Admin, Broker, and User roles with granular permissions
              </p>
            </div>
            
            <div className="text-center p-6">
              <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-Time Data
              </h3>
              <p className="text-gray-600">
                Live market data and portfolio tracking with instant updates
              </p>
            </div>
            
            <div className="text-center p-6">
              <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Encrypted Storage
              </h3>
              <p className="text-gray-600">
                All sensitive data encrypted with industry-standard algorithms
              </p>
            </div>
            
            <div className="text-center p-6">
              <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Optimized for speed with modern architecture and caching
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of traders using our secure platform
          </p>
          <button
            onClick={() => router.push('/register')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Create Your Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <span className="ml-2 text-lg font-semibold">Stock Market Auth</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Stock Market Auth. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
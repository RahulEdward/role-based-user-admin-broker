'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { TrendingUp, DollarSign, BarChart3, Activity, Shield, Settings } from 'lucide-react';

interface BrokerProfile {
  has_access_token: boolean;
  has_feed_token: boolean;
  is_2fa_enabled: boolean;
  broker_name: string;
  client_id?: string;
  broker_session_active: boolean;
}

interface Portfolio {
  holdings: Array<{
    symbol: string;
    quantity: number;
    avg_price: number;
    current_price: number;
  }>;
  total_value: number;
  total_investment: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/landing');
      return;
    }
    fetchBrokerProfile();
  }, [user, router]);

  const fetchBrokerProfile = async () => {
    try {
      const response = await api.get('/api/broker/profile');
      setBrokerProfile(response.data);
      setConnected(response.data.broker_session_active && response.data.has_access_token && response.data.has_feed_token);
      
      if (response.data.has_access_token) {
        fetchPortfolio();
      }
    } catch (error) {
      console.error('Failed to fetch broker profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/api/broker/portfolio');
      setPortfolio(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  };

  const connectToBroker = async () => {
    try {
      await api.post('/api/broker/connect');
      fetchBrokerProfile();
    } catch (error) {
      console.error('Failed to connect to broker:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Trading Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={() => router.push('/setup-2fa')}
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Connection Status */}
        <div className="mb-6">
          <div className={`p-4 rounded-lg ${connected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className={`w-5 h-5 ${connected ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className={`ml-2 font-medium ${connected ? 'text-green-800' : 'text-yellow-800'}`}>
                  {connected ? 'Connected to Angel Broker' : 'Not Connected to Broker'}
                </span>
              </div>
              {!connected ? (
                <div className="space-x-2">
                  {!brokerProfile?.is_2fa_enabled && (
                    <button
                      onClick={() => router.push('/setup-2fa')}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
                    >
                      Setup 2FA First
                    </button>
                  )}
                  {brokerProfile?.is_2fa_enabled && (
                    <button
                      onClick={() => router.push('/broker-login')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                      Connect to Broker
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-x-2">
                  <span className="text-sm text-green-800">
                    Client ID: {brokerProfile?.client_id}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                  >
                    Disconnect & Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{portfolio.total_value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Investment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{portfolio.total_investment.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Activity className={`w-8 h-8 ${portfolio.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">P&L</p>
                  <p className={`text-2xl font-bold ${portfolio.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{portfolio.profit_loss.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className={`w-8 h-8 ${portfolio.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Returns</p>
                  <p className={`text-2xl font-bold ${portfolio.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio.profit_loss_percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Holdings Table */}
        {portfolio && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Holdings
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {portfolio.holdings.map((holding, index) => {
                      const pnl = (holding.current_price - holding.avg_price) * holding.quantity;
                      const pnlPercent = ((holding.current_price - holding.avg_price) / holding.avg_price) * 100;
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {holding.symbol}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {holding.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{holding.avg_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{holding.current_price.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Connection State */}
        {!connected && (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect to Angel Broker
            </h3>
            <p className="text-gray-500 mb-6">
              Connect your Angel Broker account to view your portfolio and start trading
            </p>
            <div className="space-y-3">
              {!brokerProfile?.is_2fa_enabled && (
                <p className="text-sm text-yellow-600">
                  You need to setup 2FA before connecting to your broker
                </p>
              )}
              <div className="flex justify-center space-x-4">
                {!brokerProfile?.is_2fa_enabled && (
                  <button
                    onClick={() => router.push('/setup-2fa')}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700"
                  >
                    Setup 2FA
                  </button>
                )}
                {brokerProfile?.is_2fa_enabled && (
                  <button
                    onClick={() => router.push('/broker-login')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Connect to Broker
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
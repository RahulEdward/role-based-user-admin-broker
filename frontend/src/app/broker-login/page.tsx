'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { TrendingUp, Shield } from 'lucide-react';

const brokerLoginSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
  totp_token: z.string().length(6, 'TOTP must be 6 digits').regex(/^\d+$/, 'TOTP must contain only numbers'),
});

type BrokerLoginForm = z.infer<typeof brokerLoginSchema>;

export default function BrokerLogin() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BrokerLoginForm>({
    resolver: zodResolver(brokerLoginSchema),
  });

  const onSubmit = async (data: BrokerLoginForm) => {
    try {
      setError('');
      const response = await api.post('/api/auth/broker-login', data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Broker login failed');
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto w-12 h-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Broker Login Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Angel Broker Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your Angel Broker credentials and 2FA token
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Your API key is already stored securely from registration. 
              We'll use it along with your credentials to authenticate with Angel Broker.
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
                Client ID
              </label>
              <input
                {...register('client_id')}
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your Angel Broker Client ID"
              />
              {errors.client_id && (
                <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                PIN (4 digits)
              </label>
              <input
                {...register('pin')}
                type="password"
                maxLength={4}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your 4-digit PIN"
              />
              {errors.pin && (
                <p className="mt-1 text-sm text-red-600">{errors.pin.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="totp_token" className="block text-sm font-medium text-gray-700">
                2FA TOTP (6 digits)
              </label>
              <input
                {...register('totp_token')}
                type="text"
                maxLength={6}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter 6-digit TOTP code"
              />
              {errors.totp_token && (
                <p className="mt-1 text-sm text-red-600">{errors.totp_token.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Connecting to Broker...' : 'Connect to Angel Broker'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have 2FA enabled?{' '}
              <button
                type="button"
                onClick={() => router.push('/setup-2fa')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Set up 2FA
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
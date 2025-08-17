'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Shield, QrCode } from 'lucide-react';

const verifySchema = z.object({
  token: z.string().length(6, 'TOTP must be 6 digits').regex(/^\d+$/, 'TOTP must contain only numbers'),
});

type VerifyForm = z.infer<typeof verifySchema>;

interface TOTPSetup {
  secret: string;
  qr_code: string;
}

export default function Setup2FA() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [totpSetup, setTotpSetup] = useState<TOTPSetup | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.is_2fa_enabled) {
      router.push('/');
      return;
    }

    setupTOTP();
  }, [user, router]);

  const setupTOTP = async () => {
    try {
      const response = await api.post('/api/auth/setup-2fa');
      setTotpSetup(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: VerifyForm) => {
    try {
      setError('');
      await api.post('/api/auth/verify-2fa', data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/broker-login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || '2FA verification failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto w-12 h-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              2FA Setup Complete!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to broker login...
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
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Setup Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Scan the QR code with your authenticator app
          </p>
        </div>

        {totpSetup && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-center space-y-4">
                <QrCode className="w-8 h-8 mx-auto text-gray-600" />
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${totpSetup.qr_code}`}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Manual entry key:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                    {totpSetup.secret}
                  </code>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Enter 6-digit code from your authenticator app
                </label>
                <input
                  {...register('token')}
                  type="text"
                  maxLength={6}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-lg tracking-widest"
                  placeholder="000000"
                />
                {errors.token && (
                  <p className="mt-1 text-sm text-red-600">{errors.token.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Verifying...' : 'Verify and Enable 2FA'}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Use apps like Google Authenticator, Authy, or Microsoft Authenticator
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth';
import { useAuth } from '@/contexts';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleRegister = async (
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setIsLoading(true);
      setError(undefined);

      await register({ email, username, password, firstName, lastName });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center py-12 px-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">IT Social Network</h1>
          <p className="text-blue-100">Rejoignez la communauté des professionnels IT</p>
        </div>

        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />

        <p className="mt-8 text-center text-blue-100 text-sm">
          © 2024 IT Social Network. All rights reserved.
        </p>
      </div>
    </div>
  );
}

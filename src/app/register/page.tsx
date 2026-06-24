'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth';

export default function RegisterPage() {
  const router = useRouter();
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

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Registration failed');
        return;
      }

      const data = await response.json();

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home
      router.push('/');
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
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

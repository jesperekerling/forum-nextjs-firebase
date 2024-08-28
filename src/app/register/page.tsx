'use client';
import React, { useState } from 'react';
import { registerUser } from '../../firebase'; // Adjust the path as necessary
import Header from '@/components/layout/Header';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      setSuccess('User registered successfully!');
      setError('');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('User already exists.');
      } else {
        setError('Failed to register user');
      }
      setSuccess('');
    }
  };

  return (
    <div className='mx-auto container'>
      <Header />
      <div className='flex justify-center items-center min-h-screen'>
        <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2">Email:</label>
              <input
                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Password:</label>
              <input
                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600" type="submit">Register</button>
          </form>
          {error && <p className="mt-4 text-red-500">{error}</p>}
          {success && <p className="mt-4 text-green-500">{success}</p>}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
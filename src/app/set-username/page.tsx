'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const SetUsername = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          userName: username,
          email: user.email,
          UserUID: user.uid
        });
        router.push('/');
      } catch (error) {
        console.error("Error setting username: ", error);
        setError("Failed to set username");
      }
    } else {
      setError("No user is logged in");
    }
  };

  return (
    <div className="mx-auto container">
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Set Username</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2">Username:</label>
              <input
                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Set Username
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetUsername;
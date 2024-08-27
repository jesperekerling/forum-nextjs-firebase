'use client'

import React from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Update import

const LoggedIn = () => {
  const [user, setUser] = React.useState<{ email: string | null } | null>(null);
  const router = useRouter(); // Update to useRouter from next/navigation

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <h1 className="text-2xl mb-4">Welcome, {user.email}</h1>
      <p>You are now logged in.</p>
    </div>
  );
};

export default LoggedIn;
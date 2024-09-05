import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.userName);
          } else {
            console.log('No such user!');
          }
        } catch (err) {
          console.error('Error accessing Firestore: ', err);
          setError('Failed to access Firestore');
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <header className='bg-white dark:bg-black flex px-8 bg-opacity-85 rounded-lg'>
        <span className='flex-none text-xl font-bold py-3 pr-10'><Link href="/">Forum</Link></span>
        <ul className='flex flex-1 gap-4 py-3'>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/threads">Threads</Link></li>
            {isLoggedIn ? (
            <>
                <li className='flex-1 text-right pr-5'>{username}</li>
                <li className='text-right'><button onClick={handleLogout}>Logout</button></li>
                {error && <li className="text-red-500">{error}</li>}
            </>
            ) : (
            <>
                <li className='flex-1 text-right'><Link href="/login">Log in</Link></li>
                <li className='text-right'><Link href="/register">Register</Link></li>
            </>
            )}
        </ul>
    </header>
  );
}

export default Header;
'use client'

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
  const [menuOpen, setMenuOpen] = useState(false);
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className='bg-white dark:bg-black flex flex-wrap items-center justify-between px-8 bg-opacity-85 rounded-lg mb-10'>
      <span className='flex-none text-xl font-bold py-3 pr-10'>
        <Link href="/" className='hover:opacity-60'>Forum</Link>
      </span>
      <button
        className='block md:hidden text-xl ml-auto'
        onClick={toggleMenu}
      >
        &#9776;
      </button>
      <div className='w-full md:flex md:items-center md:w-auto md:flex-1'>
        <ul className={`flex flex-col md:flex-row flex-1 gap-4 py-3 items-center ${menuOpen ? 'block' : 'hidden'} md:flex md:justify-start`}>
          <li><Link href="/threads" className='hover:opacity-60'>Threads</Link></li>
          <li><Link href="/comments" className='hover:opacity-60'>Comments</Link></li>
          <li><Link href="/tags" className='hover:opacity-60'>Tags</Link></li>
          {isLoggedIn ? (
            <>
              <li className='md:flex-1 text-right pr-5 hidden md:inline-block'>
                <span className='text-gray-600 dark:text-gray-200 text-xs pr-2'>Logged in as: </span> 
                {username}
              </li>
              <li className='md:flex-none text-right'>
                <button onClick={handleLogout} className='hover:opacity-60'>Logout</button>
              </li>
              {error && <li className="text-red-500">{error}</li>}
            </>
          ) : (
            <>
              <li className='md:flex-1 text-right'>
                <Link href="/login" className='hover:opacity-60'>Log in</Link>
              </li>
              <li className='text-right'>
                <Link href="/register" className='hover:opacity-60'>Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Header;
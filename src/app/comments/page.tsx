'use client'

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { Thread, User } from '@/types/types';
import { Timestamp } from 'firebase/firestore';
import Header from '@/components/layout/Header';

const CommentsPage: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    async function fetchData() {
      const q = query(collection(db, 'threads'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const threadsData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Thread)
      );

      setThreads(threadsData);

      // Fetch user details for each thread creator
      const userPromises = threadsData
        .filter(thread => thread.creator) // Ensure creator is defined
        .map(thread => getDoc(doc(db, 'users', thread.creator)));
      const userDocs = await Promise.all(userPromises);
      const usersData = userDocs.reduce((acc, userDoc) => {
        if (userDoc.exists()) {
          acc[userDoc.id] = userDoc.data() as User;
        }
        return acc;
      }, {} as { [key: string]: User });
      setUsers(usersData);
    }

    fetchData();
  }, []);

  return (
    <div className="container mx-auto">
      <Header />
      <div className="container mx-auto p-4">
        <h2 className="font-bold text-xl pb-3">Latest Comments</h2>
        <p className='pb-7 text-sm text-gray-700 dark:text-gray-300'>Displaying the latest updated threads based on comments.</p>
        {threads.length > 0 ? (
          <ul>
            {threads.map((thread) => (
              <li key={thread.id}>
                <Link href={`/threads/${thread.id}`}>
                  <div className='bg-white shadow-md rounded-lg p-6 mb-6 hover:opacity-65'>
                    <div className='flex'>
                      <h2 className='font-semibold flex-1 dark:text-black text-lg'>
                        {thread.title}
                      </h2>
                      <span className='bg-gray-700 text-white px-2 py-1 text-sm rounded-md'>{thread.category}</span>
                    </div>
                    <p className='text-sm text-gray-500'>
                      Posted by {users[thread.creator]?.userName || 'Unknown'} at {new Intl.DateTimeFormat('sv-SE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }).format(
                        thread.updatedAt instanceof Timestamp
                          ? thread.updatedAt.toDate()
                          : new Date(thread.updatedAt)
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No threads available.</p>
        )}
      </div>
    </div>
  );
};

export default CommentsPage;
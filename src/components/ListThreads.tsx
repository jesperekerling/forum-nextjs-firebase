import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import { Thread, User } from '@/types/types';

interface AllThreadsProps {
  threads?: Thread[];
  showHeadline?: boolean;
}

const AllThreads: React.FC<AllThreadsProps> = ({ threads: initialThreads, showHeadline = true }) => {
  const [threads, setThreads] = useState<Thread[]>(initialThreads || []);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    if (!initialThreads) {
      const fetchData = async () => {
        try {
          const threadsQuery = query(
            collection(db, 'threads'),
            orderBy('createdAt', 'desc'),
            limit(4)
          );
          const threadsSnapshot = await getDocs(threadsQuery);

          const threadsData = threadsSnapshot.docs.map(
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
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [initialThreads]);

  return (
    <div>
      {showHeadline && <h2 className="font-bold text-xl pb-3">Latest Threads</h2>}
      {threads.length > 0 ? (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link href={`/threads/${thread.id}`}>
                <div className='bg-white shadow-md rounded-lg p-6 my-5 hover:opacity-65'>
                  <div className='flex'>
                    <h2 className='font-semibold flex-1 dark:text-black text-lg truncate'>
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
                      thread.createdAt instanceof Timestamp
                        ? thread.createdAt.toDate()
                        : new Date(thread.createdAt)
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
      <div className="pt-5 pb-10 mx-auto text-center">
        <a href="/threads" className="bg-black text-white py-3 px-5 rounded-md dark:text-black dark:bg-white hover:opacity-75">Go to Threads</a>
      </div>
    </div>
  );
};

export default AllThreads;
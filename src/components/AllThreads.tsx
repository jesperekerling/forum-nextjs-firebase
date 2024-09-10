import { db } from '@/firebase';
import { Thread, User } from '@/types/types';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';

type ThreadCategory = "THREAD" | "QNA";

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
          const threadsQuery = query(collection(db, 'threads'), orderBy('updatedAt', 'desc'));
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
          const userPromises = threadsData.map(thread => getDoc(doc(db, 'users', thread.creator)));
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
    <div className="container mx-auto">
      {showHeadline && <h2 className="font-bold text-xl pb-3">Latest Threads</h2>}
      <div className="pt-0 mx-auto text-right">
        <a
          href="/create-thread"
          className="bg-black text-white py-3 px-5 rounded-md dark:text-black dark:bg-white hover:opacity-75"
        >
          Create Thread
        </a>
      </div>
      <p className='pb-7 text-sm text-gray-700 dark:text-gray-300'>Displaying the latest new threads of the forum.</p>
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
                  <p className="text-sm text-gray-500">Created by: {users[thread.creator]?.userName || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">
                    {new Intl.DateTimeFormat('sv-SE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }).format(
                      thread.creationDate instanceof Timestamp
                        ? thread.creationDate.toDate()
                        : new Date(thread.creationDate)
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
  );
};

export default AllThreads;
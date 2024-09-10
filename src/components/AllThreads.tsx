import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Thread, User } from '@/types/types';
import { Timestamp } from 'firebase/firestore';

type ThreadCategory = "THREAD" | "QNA";

function AllThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch threads
        const querySnapshot = await getDocs(collection(db, "threads"));
        const threadsData = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Thread)
        );

        // Sort threads by creationDate in descending order
        threadsData.sort(
          (a, b) =>
            (b.creationDate instanceof Timestamp ? b.creationDate.toDate() : new Date(b.creationDate)).getTime() -
            (a.creationDate instanceof Timestamp ? a.creationDate.toDate() : new Date(a.creationDate)).getTime()
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
    }

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="font-bold text-xl pb-3">Latest Threads</h2>
      <p className='pb-7 text-sm text-gray-700 dark:text-gray-300'>Displaying the latest new threads of the forum.</p>
      {threads.length > 0 ? (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link href={`/threads/${thread.id}`}>
                <div className='bg-white shadow-md rounded-lg p-6 mb-6 hover:opacity-65'>
                  <h3 className="font-bold text-lg">{thread.title}</h3>
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
}

export default AllThreadsPage;
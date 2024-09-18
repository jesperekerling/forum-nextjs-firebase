'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Header from '@/components/layout/Header';
import AllThreads from '@/components/AllThreads';
import { Thread } from '@/types/types';

const TagDetailsPage: React.FC = () => {
  const { tag } = useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tag) {
      const fetchThreads = async () => {
        try {
          const threadsQuery = query(
            collection(db, 'threads'),
            where('tags', 'array-contains', tag)
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
        } catch (error) {
          console.error('Error fetching threads:', error);
          setError('Error fetching threads');
        }
      };

      fetchThreads();
    }
  }, [tag]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!threads.length) {
    return <p>Loading...</p>;
  }

  return (
    <div className='mx-auto container'>
      <Header />
      <div className="container mx-auto p-4">
        <h2 className="font-bold text-xl pb-3">Threads tagged with &quot;{tag}&quot;</h2>
        <AllThreads threads={threads} showHeadline={false} />
      </div>
    </div>
  );
};

export default TagDetailsPage;
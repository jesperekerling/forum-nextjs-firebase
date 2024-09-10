'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import Header from '@/components/layout/Header';

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsSnapshot = await getDocs(collection(db, 'tags'));
        const tagsData = tagsSnapshot.docs.map(doc => doc.id);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className='mx-auto container'>
      <Header />
      <div className="container mx-auto p-4">
        <h2 className="font-bold text-xl pb-3">All Tags</h2>
        {tags.length > 0 ? (
          <ul className='flex flex-wrap gap-5 mt-10'>
            {tags.map((tag) => (
              <li key={tag} className='py-3'>
                <Link href={`/tags/${tag}`} className='bg-white shadow-md rounded-lg p-4 hover:opacity-65'>
                  <span className="text-blue-500 hover:underline">{tag}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tags available.</p>
        )}
      </div>
    </div>
  );
};

export default TagsPage;
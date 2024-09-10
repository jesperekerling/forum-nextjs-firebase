'use client';

import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { User } from '@/types/types';

const CreateThreadPage: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('THREAD');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [currentUserUID, setCurrentUserUID] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUserUID(user.uid);

        // Fetch the current user's moderator status
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setIsModerator(userData.isModerator);
        }
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserUID) {
      try {
        const newThread = {
          title,
          description,
          category,
          tags,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          creator: currentUserUID,
        };
        const docRef = await addDoc(collection(db, 'threads'), newThread);

        // Update tags collection
        const batch = writeBatch(db);
        tags.forEach(tag => {
          const tagRef = doc(db, 'tags', tag);
          batch.set(tagRef, { threadIds: arrayUnion(docRef.id) }, { merge: true });
        });
        await batch.commit();

        router.push(`/threads/${docRef.id}`);
      } catch (error) {
        console.error('Error creating thread:', error);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        {isLoggedIn && isModerator ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="THREAD">Thread</option>
                <option value="ANNOUNCEMENT">Announcement</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Add tags separated by commas"
              />
              <div className="mt-2">
                {tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    {tag}
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => handleTagDelete(tag)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="bg-black hover:bg-blue-700 text-white font-semibold py-3 px-5 mt-3 rounded-md focus:outline-none focus:shadow-outline"
            >
              Create Thread
            </button>
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default CreateThreadPage;
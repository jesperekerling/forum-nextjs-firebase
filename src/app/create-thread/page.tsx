'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, writeBatch, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/layout/Header';
import { Thread, User } from '@/types/types';

const EditThreadPage: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
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

    const threadIdMatch = pathname?.match(/\/threads\/([^\/]+)\/edit/);
    const threadId = threadIdMatch ? threadIdMatch[1] : null;
    if (threadId) {
      const fetchThread = async () => {
        try {
          const threadDocRef = doc(db, 'threads', threadId);
          const threadDoc = await getDoc(threadDocRef);
          if (threadDoc.exists()) {
            const threadData = threadDoc.data() as Thread;
            setThread(threadData);
            setTitle(threadData.title);
            setDescription(threadData.description);
            setCategory(threadData.category);
            setTags(threadData.tags || []);
          } else {
            console.log('No such thread!');
          }
        } catch (error) {
          console.error('Error fetching thread:', error);
        }
      };

      fetchThread();
    }
  }, [pathname]);

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
    const threadIdMatch = pathname?.match(/\/threads\/([^\/]+)\/edit/);
    const threadId = threadIdMatch ? threadIdMatch[1] : null;
    if (threadId && thread) {
      try {
        const updatedData = {
          title,
          description,
          category,
          tags,
          updatedAt: serverTimestamp(),
        };
        await updateDoc(doc(db, 'threads', threadId), updatedData);

        // Update tags collection
        const batch = writeBatch(db);
        const oldTags = thread.tags || [];
        const newTags = tags;

        // Remove thread ID from old tags
        oldTags.forEach(tag => {
          const tagRef = doc(db, 'tags', tag);
          batch.update(tagRef, { threadIds: arrayRemove(threadId) });
        });

        // Add thread ID to new tags
        newTags.forEach(tag => {
          const tagRef = doc(db, 'tags', tag);
          batch.set(tagRef, { threadIds: arrayUnion(threadId) }, { merge: true });
        });

        await batch.commit();

        router.push(`/threads/${threadId}`);
      } catch (error) {
        console.error('Error updating thread:', error);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-10 bg-white shadow-md rounded mb-4">
        <h1 className='text-2xl font-bold py-5'>Edit Thread</h1>
        {isLoggedIn ? (
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
                <option value="QNA">QNA</option>
                {isModerator && <option value="AD">AD</option>}
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
              className="bg-black hover:bg-opacity-65 text-white font-semibold py-3 px-5 mt-3 rounded-md focus:outline-none focus:shadow-outline"
            >
              Update Thread
            </button>
          </form>
        ) : (
          <p className="text-red-500">Please log in to post a new thread.</p>
        )}
      </div>
    </div>
  );
};

export default EditThreadPage;
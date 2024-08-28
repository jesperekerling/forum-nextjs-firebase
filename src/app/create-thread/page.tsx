'use client'

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function createThreadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [creator, setCreator] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCreator(user.uid);
      } else {
        // Handle the case where the user is not logged in
        console.log('User is not logged in');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newThread = {
      title,
      description,
      category,
      creator,
      creationDate: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'threads'), newThread);
      console.log('Document successfully written!');
      // Reset form fields
      setTitle('');
      setDescription('');
      setCategory('');
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  };

  return (
    <div>
      <h1>Create a New Thread</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Thread</button>
      </form>
    </div>
  );
}

export default createThreadPage;
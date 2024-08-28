'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import Header from '@/components/layout/Header';

type ThreadCategory = "THREAD" | "QNA" | "hundar";

type Thread = {
  id: string;
  title: string;
  category: ThreadCategory;
  creationDate: string;
  description: string;
  creator: string;
};

type Comment = {
  id: string;
  threadId: string;
  content: string;
  creator: string;
  createdAt: Timestamp;
};

const ThreadDetailPage: React.FC = () => {
  const pathname = usePathname();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');

  useEffect(() => {
    const threadId = pathname?.split('/').pop();
    if (threadId) {
      const fetchThread = async () => {
        try {
          const threadDoc = await getDoc(doc(db, 'threads', threadId));
          if (threadDoc.exists()) {
            const threadData = threadDoc.data() as Thread;
            setThread(threadData);
          } else {
            console.log('No such thread!');
          }
        } catch (error) {
          console.error('Error fetching thread:', error);
        }
      };

      const fetchComments = async () => {
        try {
          const commentsQuery = query(
            collection(db, 'comments'),
            where('threadId', '==', threadId)
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsData = commentsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: (data.createdAt as Timestamp) || Timestamp.now()
            };
          }) as Comment[];
          setComments(commentsData);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };

      fetchThread();
      fetchComments();
    }
  }, [pathname]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const threadId = pathname?.split('/').pop();
    if (threadId && newComment.trim()) {
      try {
        const newCommentData = {
          content: newComment,
          createdAt: serverTimestamp(),
          creator: 'ZiWERIuvMNFzW8Jk3ExDG1VAZj2', // Replace with actual user ID
          threadId: threadId
        };
        const docRef = await addDoc(collection(db, 'comments'), newCommentData);
        const addedComment = {
          ...newCommentData,
          id: docRef.id,
          createdAt: Timestamp.now() // Use current timestamp for immediate display
        } as Comment;
        setComments([...comments, addedComment]);
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        {thread ? (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>
            <p className="text-gray-700 mb-4">{thread.description}</p>
            <p className="text-sm text-gray-500">Category: {thread.category}</p>
            <p className="text-sm text-gray-500">Created by: {thread.creator}</p>
            <p className="text-sm text-gray-500">Creation Date: {new Date(thread.creationDate).toLocaleString()}</p>
          </div>
        ) : (
          <p>Loading thread...</p>
        )}
        <div>
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="bg-gray-100 p-4 mb-4 rounded-lg">
                <p className="text-gray-700">{comment.content}</p>
                <p className="text-sm text-gray-500">By: {comment.creator}</p>
                <p className="text-sm text-gray-500">At: {comment.createdAt.toDate().toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Add a Comment</h2>
          <form onSubmit={handleCommentSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
            <textarea
              className="w-full p-2 mb-4 border rounded"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              rows={4}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;
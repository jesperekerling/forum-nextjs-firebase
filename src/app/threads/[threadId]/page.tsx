'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/layout/Header';
import { Thread, User, Comment } from '@/types/types';
import Link from 'next/link';

const ThreadDetailPage: React.FC = () => {
  const pathname = usePathname();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [creatorName, setCreatorName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const [currentUserUID, setCurrentUserUID] = useState<string | null>(null);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUserUID(user.uid);

        // Fetch the current user's username and moderator status
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setIsModerator(userData.isModerator);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    const threadId = pathname?.split('/').pop();
    if (threadId) {
      const fetchThread = async () => {
        try {
          const threadDoc = await getDoc(doc(db, 'threads', threadId));
          if (threadDoc.exists()) {
            const threadData = threadDoc.data() as Thread;
            setThread({ ...threadData, id: threadDoc.id });
            setIsLocked(threadData.isLocked);

            // Fetch the creator's username
            const userDoc = await getDoc(doc(db, 'users', threadData.creator));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              setCreatorName(userData.userName);
            } else {
              console.log('No such user!');
            }
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

          // Fetch usernames for each comment creator
          const usernamesMap: { [key: string]: string } = {};
          await Promise.all(commentsData.map(async (comment) => {
            if (!usernamesMap[comment.creator]) {
              const userDoc = await getDoc(doc(db, 'users', comment.creator));
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                usernamesMap[comment.creator] = userData.userName;
              }
            }
          }));
          setUsernames(usernamesMap);
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
    if (threadId && newComment.trim() && currentUserUID) {
      try {
        const newCommentData = {
          content: newComment,
          createdAt: serverTimestamp(),
          creator: currentUserUID,
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

        // Fetch the username for the new comment creator
        if (!usernames[currentUserUID]) {
          const userDoc = await getDoc(doc(db, 'users', currentUserUID));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUsernames((prevUsernames) => ({
              ...prevUsernames,
              [currentUserUID]: userData.userName
            }));
          }
        }

        // Update the thread's updatedAt timestamp
        await setDoc(doc(db, 'threads', threadId), {
          updatedAt: serverTimestamp()
        }, { merge: true });

      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleToggleLock = async () => {
    const threadId = pathname?.split('/').pop();
    if (threadId) {
      try {
        const threadRef = doc(db, 'threads', threadId);
        await updateDoc(threadRef, {
          isLocked: !isLocked
        });
        setIsLocked(!isLocked);
      } catch (error) {
        console.error('Error updating thread lock status:', error);
      }
    } else {
      console.error('Thread ID is undefined');
    }
  };

  const handleMarkAsCorrect = async (commentId: string) => {
    const threadId = pathname?.split('/').pop();
    if (threadId) {
      try {
        const threadRef = doc(db, 'threads', threadId);
        const commentRef = doc(db, 'comments', commentId);

        // Update the thread to store the correct answer ID
        await updateDoc(threadRef, {
          correctAnswerId: commentId
        });

        // Update the comment to mark it as the correct answer
        await updateDoc(commentRef, {
          isCorrectAnswer: true
        });

        // Update the local state
        setThread((prevThread) => prevThread ? { ...prevThread, correctAnswerId: commentId } : prevThread);
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId ? { ...comment, isCorrectAnswer: true } : comment
          )
        );
      } catch (error) {
        console.error('Error marking comment as correct answer:', error);
      }
    } else {
      console.error('Thread ID is undefined');
    }
  };

  const handleUnmarkAsCorrect = async (commentId: string) => {
    const threadId = pathname?.split('/').pop();
    if (threadId) {
      try {
        const threadRef = doc(db, 'threads', threadId);
        const commentRef = doc(db, 'comments', commentId);

        // Update the thread to remove the correct answer ID
        await updateDoc(threadRef, {
          correctAnswerId: ''
        });

        // Update the comment to unmark it as the correct answer
        await updateDoc(commentRef, {
          isCorrectAnswer: false
        });

        // Update the local state
        setThread((prevThread) => prevThread ? { ...prevThread, correctAnswerId: '' } : prevThread);
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId ? { ...comment, isCorrectAnswer: false } : comment
          )
        );
      } catch (error) {
        console.error('Error unmarking comment as correct answer:', error);
      }
    } else {
      console.error('Thread ID is undefined');
    }
  };

  const sortedComments = comments.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

  return (
    <div className='mx-auto container'>
      <Header />
      <div className="container mx-auto p-4">
        {thread ? (
          <div className="bg-white dark:bg-black dark:text-white shadow-md rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4 dark:text-black">{thread.title}</h1>
            <p className="text-gray-700 mb-4" style={{ whiteSpace: 'pre-wrap' }}>{thread.description}</p>
            <p className="text-sm text-gray-500">Created by: {creatorName}</p>
            <p className="text-sm text-gray-500">
              Creation Date: {new Intl.DateTimeFormat('sv-SE', {
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
            <p className="text-sm text-gray-500">Category: {thread.category}</p>
            {thread.tags && thread.tags.length > 0 && (
              <p className="text-sm text-gray-500">Tags: {thread.tags.join(', ')}</p>
            )}

            {isModerator || thread.creator === currentUserUID ? (
              <div className='moderator'>
                Moderator stuff:<br />
                <ul>
                  <li>
                    <Link href={`/threads/${thread.id}/edit`}>
                      <span className='text-blue-500 hover:underline'>
                        Edit
                      </span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleToggleLock} className='text-blue-500 hover:underline'>
                      {isLocked ? 'Open Thread' : 'Close Thread'}
                    </button>
                  </li>
                  <li>
                    <Link href={`/threads/${thread.id}/delete`}>
                      <span className='text-blue-500 hover:underline'>
                        Delete
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p>Loading thread...</p>
        )}
        <div>
          {isLoggedIn && !isLocked && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Write Comment</h2>
              <form onSubmit={handleCommentSubmit} className="my-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-black bg-white dark:text-white dark:bg-black"
                  placeholder="Add a comment..."
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
              </form>
            </div>
          )}
          {isLocked && (
            <p className="text-red-500">This thread is locked. No new comments can be posted.</p>
          )}
          <div>
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            {sortedComments.map((comment) => (
              <div key={comment.id} className={`bg-white dark:bg-black dark:text-white shadow-md rounded-lg p-4 mb-4 ${comment.isCorrectAnswer ? 'bg-lightblue-100' : ''}`}>
                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                <p className="text-sm text-gray-500">
                  Posted by {usernames[comment.creator] || 'Unknown'} at {new Intl.DateTimeFormat('sv-SE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }).format(
                    comment.createdAt instanceof Timestamp
                      ? comment.createdAt.toDate()
                      : new Date(comment.createdAt)
                  )}
                </p>
                {comment.isCorrectAnswer && (
                  <p className="text-sm text-blue-500 font-bold">Best answer yet, selected by Moderator</p>
                )}
                {isModerator && thread?.category === 'QNA' && (
                  <>
                    {!comment.isCorrectAnswer ? (
                      <button
                        onClick={() => handleMarkAsCorrect(comment.id)}
                        className="text-blue-500 hover:underline mt-2"
                      >
                        Mark as Correct Answer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnmarkAsCorrect(comment.id)}
                        className="text-red-500 hover:underline mt-2"
                      >
                        Unmark as Correct Answer
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;
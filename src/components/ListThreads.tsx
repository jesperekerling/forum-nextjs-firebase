import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'



type ThreadCategory = "THREAD" | "QNA";

type User = {
  id: number;
  userName: string;
  password: string;
};

type Thread = {
  id: string;
  title: string;
  category: ThreadCategory;
  creationDate: string;
  description: string;
  creator: User;
};
function ListThreads() {

const [threads, setThreads] = useState<Thread[]>([])

useEffect(() => {
  async function fetchData() {
    const querySnapshot = await getDocs(collection(db, 'threads'))
    const threadsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Thread)) 
    setThreads(threadsData)
  }
  fetchData()
}, [])


  return (
    <div>
      <h2 className='font-bold text-xl pb-3'>Latest Threads</h2>
      {threads.length > 0 ? (
        <ul>
          {threads.map(thread => (
            <li key={thread.id} className='py-2'>
              <div className='flex'>
                <h2 className='font-semibold flex-1'>{thread.title}</h2>
                <span className='bg-gray-700 text-white px-2 py-1 text-sm rounded-md'>{thread.category}</span>
              </div>
              <p className='text-sm text-gray-500'>Posted by USERNAME at {new Intl.DateTimeFormat('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }).format(new Date(thread.creationDate))}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export default ListThreads
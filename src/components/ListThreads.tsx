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
  id: number;
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
      ...doc.data()
    } as Thread)) 
    setThreads(threadsData)
  }
  fetchData()
}, [])


  return (
    <div>
      <h1>Forum Threads</h1>
      {threads.length > 0 ? (
        <ul>
          {threads.map(thread => (
            <li key={thread.id}>
              <h2>{thread.title}</h2>
              <p>{thread.description}</p>
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
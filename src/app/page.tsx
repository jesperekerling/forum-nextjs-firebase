'use client'

import Image from "next/image";
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { testFirestore } from '../firebase'; // Adjust the path as necessary
import Register from '../components/Register';


const Page = () => {
  useEffect(() => {
    testFirestore();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1>Welcome to the Page</h1>
      <Register />
    </main>
  );
};

export default Page;
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Update import
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Register from "../components/Register";
import Login from "../components/Login";
import { testFirestore } from "../firebase"; // Adjust the path as necessary
import dynamic from "next/dynamic";
import ListThreads from "@/components/ListThreads";
import {auth} from '../firebase'

const Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter(); // Update to useRouter from next/navigation

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    testFirestore();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [isMounted, router]);

  if (!isMounted) {
    return null; // or a loading spinner
  }


  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      router.push("/"); // Redirect to home page
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-xl font-bold pb-10">Forum</h1>
      
      <ListThreads />

      <h2 className="font-bold text-2xl py-4 pt-10">Login</h2>
      <Login />

      <h2 className="font-bold text-2xl pb-4 pt-10">Register</h2>
      <Register />
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });

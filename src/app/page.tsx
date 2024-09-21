"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Update import
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { testFirestore } from "../firebase"; // Adjust the path as necessary
import dynamic from "next/dynamic";
import ListThreads from "@/components/ListThreads";
import UpdatedThreads from "@/components/UpdatedThreads";
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

    <main className="container mx-auto">
      
      <div className="p-1">
        
        <h1 className="text-2xl font-bold pb-10 text-center">Forum</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <ListThreads />
          </div>
          <div>
            <UpdatedThreads />
          </div>
        </div>
      </div>
      
    </main>

  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });

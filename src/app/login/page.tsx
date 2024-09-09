"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/firebase"; // Import the initialized auth and db
import { doc, getDoc, setDoc } from "firebase/firestore";
import Header from "@/components/layout/Header";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Failed to log in");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
  
      if (!userDoc.exists()) {
        // If user document does not exist, create it with the display name
        await setDoc(doc(db, "users", user.uid), {
          userName: "",
          email: user.email,
          UserUID: user.uid
        });
        // Redirect to username form
        router.push("/set-username");
      } else {
        // User exists, check if userName is set
        const userData = userDoc.data();
        if (!userData?.userName) {
          router.push("/set-username");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error logging in with Google: ", error);
      setError("Failed to log in with Google");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      router.push("/");
    } catch (error) {
      console.error("Error logging out: ", error);
      setError("Failed to log out");
    }
  };

  return (
    <div className="mx-auto container">
      <Header />
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md max-w-md w-full">
          {isLoggedIn ? (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">You are already logged in!</h1>
              <button
                className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
              <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block mb-2">Email:</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Password:</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                type="submit"
              >
                Log In
              </button>
            </form>
            <p className="text-center pt-6 pb-4">Or</p>
            <button
              className="bg-white text-black w-full p-2 border border-gray-300 rounded hover:bg-gray-100"
              onClick={handleGoogleLogin}
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" className="w-5 inline mr-3 border-red-100">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Sign in with Google
            </button>
            {error && <p className="mt-4 text-red-500">{error}</p>}
            </>
            )}
            </div>
          </div>
        </div>
);
};

export default Login;
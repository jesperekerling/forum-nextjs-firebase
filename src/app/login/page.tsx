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
                className="w-full p-2 mt-4 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleGoogleLogin}
              >
                Login with Google
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
'use client'

import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; // Adjust the path as necessary
import { useRouter } from "next/navigation"; // Import useRouter

const LandingPage = () => {
  const router = useRouter(); // Get the router instance

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
    <div>
      <div>Inloggad på /landingpage</div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LandingPage;
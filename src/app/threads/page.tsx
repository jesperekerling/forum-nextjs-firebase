"use client";
import Header from "@/components/layout/Header";
import React from "react";
import AllThreads from "@/components/AllThreads";

const AllThreadsPage = () => {
  return (
    <main className="container mx-auto">
      
      <Header />
      
      <AllThreads />

    </main>
  );
};

export default AllThreadsPage;

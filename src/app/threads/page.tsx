"use client";
import Header from "@/components/layout/Header";
import React from "react";
import ListThreads from "@/components/AllThreads";

const AllThreadsPage = () => {
  return (
    <main className="container mx-auto">
      
      <Header />
      
      <ListThreads />

    </main>
  );
};

export default AllThreadsPage;

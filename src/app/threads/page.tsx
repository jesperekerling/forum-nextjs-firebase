"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

type Comment = {
  id: number;
  threadId: number;
  content: string;
  creator: User;
};

// Rest of your code...

// Dummy Data (Replace with actual data later)
const dummyThread: Thread = {
  id: 1,
  title: "Example Thread Title",
  category: "THREAD" as const,
  creationDate: "2023-08-28",
  description:
    "This is an example description of a thread. It contains the main content of the discussion.",
  creator: {
    id: 1,
    userName: "JohnDoe",
    password: "",
  },
};

const dummyComments: Comment[] = [
  {
    id: 2,
    threadId: 1,
    content: "This is the first comment. Great discussion!",
    creator: {
      id: 2,
      userName: "JaneDoe",
      password: "",
    },
  },
  {
    id: 3,
    threadId: 1,
    content: "This is another comment. Thanks for sharing your thoughts!",
    creator: {
      id: 2,
      userName: "User123",
      password: "",
    },
  },
];

const ThreadDetailPage: React.FC = () => {
  const [newComment, setNewComment] = useState<string>("");
  const router = useRouter();

  // Event handler for adding a comment (dummy function for now)
  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log("New comment added:", newComment);
      setNewComment(""); // Clear the input after adding a comment
    }
  };

  return (
    <div className="max-w mx-auto p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => router.push("/")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to all Threads
      </button>
      <div className="mx-32 ">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2 text-black">
            {dummyThread.title}
          </h1>
          <div className="text-sm text-gray-500 mb-4">
            <span>By {dummyThread.creator.userName}</span> |{" "}
            <span>
              {new Date(dummyThread.creationDate).toLocaleString("en-US")}
            </span>
            | <span>Category: {dummyThread.category}</span>
          </div>
          <p className="text-gray-700">{dummyThread.description}</p>
        </div>

        {/* Comments Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Comments</h2>
          {dummyComments.length > 0 ? (
            dummyComments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 py-4">
                <div className="flex items-center mb-2">
                  <span className="font-semibold text-gray-800">
                    {comment.creator.userName}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">Commented</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        {/* Add Comment Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Add a Comment</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            rows={4}
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;

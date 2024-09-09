import { Timestamp } from "firebase/firestore";

export type Comment = {
  id: string;
  threadId: string;
  content: string;
  creator: string;
  createdAt: Timestamp;
  isCorrectAnswer: boolean;
};

export type ThreadCategory = "THREAD" | "QNA" | "AD";

export type Thread = {
  updatedAt: Timestamp;
  id: string;
  title: string;
  category: ThreadCategory;
  creationDate: Timestamp;
  description: string;
  creator: string; // UID of the creator
  isLocked: boolean;
  tags: string[];
  correctAnswerId?: string;
};

export type User = {
  id: string;
  firstName: string;
  userName: string;
  password: string;
  userUID: string;
  isModerator: boolean;
};

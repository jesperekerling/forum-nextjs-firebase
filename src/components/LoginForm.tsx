import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Update import

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter(); // Update to useRouter from next/navigation

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully!');
      setError('');
     
    } catch (err) {
      console.log('Failed to log in user');
      setSuccess('');
    }
  };
  
  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('User logged in successfully!');
      
      setError('');
      
    } catch (err) {
      console.log('Failed to log in user');
      setSuccess('');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-md">
      <form onSubmit={handleEmailLogin}>
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
        <button className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600" type="submit">Login</button>
      </form>
      <button className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 mt-4" onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
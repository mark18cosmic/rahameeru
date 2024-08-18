// /components/Profile.tsx or /pages/profile.tsx
'use client'

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ReviewList from '../Review/ReviewList';

const Profile = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        setUsername(user.displayName); // Set the username when user is signed in
      }
    });

    // Clean up the subscription when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1 className='text-2xl'>Welcome, {username ? username : 'Guest'}!</h1>
      <h2>My reviews</h2>
      <ReviewList />
    </div>
  );
};

export default Profile;
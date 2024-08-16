import React from 'react';
import { useRouter } from 'next/router';
import { signInWithGoogle } from '@/app/firebase/firebaseConfig'; // Make sure to import the function correctly

const GoogleSignIn = () => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log('Google Signed-in User:', user);
      router.push('/'); // Redirect to home or a different page after successful login
    } catch (error) {
      alert('Error during Google Sign-In');
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>
        Sign In with Google
      </button>
    </div>
  );
};

export default GoogleSignIn;
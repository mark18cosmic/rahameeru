import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export const signUp = async (email: string, password: string, username: string) => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's profile with the username
    await updateProfile(user, {
      displayName: username,
    });

    console.log('User signed up successfully:', user);
  } catch (error) {
    console.error('Error during sign-up:', error);
    throw error;
  }
};

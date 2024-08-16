import { auth } from "@/app/firebase/firebaseConfig";
import { signOut } from "firebase/auth";

export const logout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };
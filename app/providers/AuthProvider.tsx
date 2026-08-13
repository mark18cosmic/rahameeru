"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/firebaseConfig";

/** Keeps `users/{uid}` in step with the account, so admins can see everyone. */
async function recordProfile(u: User) {
  try {
    await setDoc(
      doc(db, "users", u.uid),
      {
        email: u.email ?? "",
        name: u.displayName ?? "",
        photoURL: u.photoURL ?? "",
        lastSeenAt: Date.now(),
      },
      { merge: true }
    );
  } catch {
    // Rules may refuse this for a signed-out race; nothing here is critical.
  }
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Stamp a profile document on every sign-in. The client SDK cannot list
      // Firebase Auth, so the admin console's user table is built from these —
      // without this, anyone who signed in but never favourited anything was
      // invisible to it. Best-effort and merged, so it never clobbers points
      // or favourites and never blocks sign-in if the write is refused.
      if (u) void recordProfile(u);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

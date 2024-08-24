'use client'

import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/app/firebase/firebaseConfig';

export const DisplayRating = ({ restaurantId }: { restaurantId: string }) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchRatings = async () => {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);

      if (restaurantDoc.exists()) {
        const ratings = restaurantDoc.data()?.ratings || [];
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc: number, rating: number) => acc + rating, 0);
          const avg = sum / ratings.length;
          setAverageRating(avg);
        }
      }
    };

    fetchRatings();
  }, [restaurantId]);

  return (
    <div>
      {averageRating !== null ? (
        <p>Average Rating: {averageRating.toFixed(1)}</p>
      ) : (
        <p>No ratings yet</p>
      )}
    </div>
  );
};

// Test Firestore initialization
const testFirestoreConnection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "restaurants")); // Example collection
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
    console.log("Firestore connected successfully!");
  } catch (error) {
    console.error("Error connecting to Firestore:", error);
  }
};

export default testFirestoreConnection;

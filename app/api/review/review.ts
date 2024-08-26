import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig"; // Assuming you've already set up Firebase
import Review from "@/app/components/buttons/Review";

export interface ReviewProps {
  id: string;
  rating: number;
  name: string;
  content: string;
  restaurantId: string;
  userId: string // Optional since it will be set to new Date() by default
}

export const addReview = async (review: ReviewProps) => {
  try {
    await addDoc(collection(db, "reviews"), {
      rating: review.rating,
      name: review.name,
      content: review.content,
      userId: review.userId, // Optional if linking reviews to users
      restaurantId: review.restaurantId, // Optional if linking reviews to restaurants
    });
    console.log("Review added!");
  } catch (e) {
    console.error("Error adding review: ", e);
  }
};

export const getReviewsByRestaurant = async (restaurantId: string) => {
  try {
    const reviewsCollection = collection(db, "reviews");
    const q = query(
      reviewsCollection,
      where("restaurantId", "==", restaurantId)
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as ReviewProps[]; // Ensure data matches the Review type
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const getRatingsByRestaurant = async (restaurantId: string): Promise<number[]> => {
  const reviewsRef = collection(db, 'reviews');
  const q = query(reviewsRef, where('restaurantId', '==', restaurantId));

  const querySnapshot = await getDocs(q);
  const rating: number[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.rating) {
      rating.push(data.rating);
    }
  });

  return rating;
};

// Example usage:
// const newReview = {
//   rating: 4,
//   name: "Jane Doe",
//   content: "The ambiance was great, but the food was just okay.",
//   userId: "user456",
//   restaurantId: "restaurant789"
// };

// addReview(newReview);

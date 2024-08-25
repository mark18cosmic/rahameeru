import { collection, addDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";  // Assuming you've already set up Firebase

export interface ReviewProps {
    rating: number;
    name: string;
    content: string;
    userId: string;
    restaurantId: string;
    createdAt?: Date; // Optional since it will be set to new Date() by default
  }

export const addReview = async (review: ReviewProps) => {
  try {
    await addDoc(collection(db, "reviews"), {
      rating: review.rating,
      name: review.name,
      content: review.content,
      userId: review.userId,  // Optional if linking reviews to users
      restaurantId: review.restaurantId,  // Optional if linking reviews to restaurants
      createdAt: new Date()
    });
    console.log("Review added!");
  } catch (e) {
    console.error("Error adding review: ", e);
  }
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

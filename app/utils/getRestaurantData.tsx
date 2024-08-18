import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig"; // Ensure this path is correct

export async function getRestaurantsData() {
    const restaurantsCollection = collection(db, "restaurants");
    const querySnapshot = await getDocs(restaurantsCollection);
    
    const restaurants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    return restaurants;
}

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/firebaseConfig'; // Adjust the import to your actual config path
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';

export async function getRestaurantsData() {
    const querySnapshot = await getDocs(collection(db, 'restaurants'));
    const restaurants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    return restaurants as unknown as RestaurantProps[];
}
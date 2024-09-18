import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/firebaseConfig'; // Adjust the import to your actual config path
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';

export async function getRestaurantsData(): Promise<RestaurantProps[]> {
    const querySnapshot = await getDocs(collection(db, 'restaurants'));
    const restaurants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        label: doc.data().label || '', // Ensure these fields match your Firestore schema
        key: doc.data().key || '',
        pricings: doc.data().pricings || '',
        ratings: doc.data().ratings || '',
        desc: doc.data().desc || '',
        image: doc.data().image || '',
        location: doc.data().location || '',
        badges: doc.data().badges || [],
        phone: doc.data().phone || '', // New phone field
        email: doc.data().email || '', // New email field
    })) as RestaurantProps[];
    return restaurants;
}

export async function generateStaticParams() {
    const restaurants: RestaurantProps[] = await getRestaurantsData();
    return restaurants.map((restaurant) => ({
        id: restaurant.label.replace(/\s+/g, '-').toLowerCase(),
    }))
}
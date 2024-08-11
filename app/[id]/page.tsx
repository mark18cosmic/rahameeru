// Define the type for a restaurant
import Image from 'next/image';
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';
// Define the type for params
interface RestaurantParams {
    id: string;
}

import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import { notFound } from 'next/navigation';

// Fetch data for the specific restaurant
export default async function RestaurantDetail({ params }: { params: RestaurantParams }) {
    const { id } = params;
    const restaurants: RestaurantProps[] = getRestaurantsData(); // Type the restaurants array
    const restaurant = restaurants.find((r: RestaurantProps) => r.label === id); // Type the restaurant parameter

    if (!restaurant) {
        notFound();
    }

    return (
        <div>
            <h1>{restaurant.label}</h1>
            <p>{restaurant.desc}</p>
            <p>Rating: {restaurant.ratings}</p>
            <Image src={restaurant.image} alt={restaurant.label} width={200} height={200} />
            <p>Location: {restaurant.location}</p>
        </div>
    );
}

// Generate paths for all restaurants
export async function generateStaticParams() {
    const restaurants: RestaurantProps[] = getRestaurantsData(); // Type the restaurants array
    return restaurants.map((restaurant) => ({
        id: restaurant.label,
    }));
    console.log(restaurants)
}

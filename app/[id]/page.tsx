// Define the type for a restaurant
import Image from 'next/image';
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';
// Define the type for params
interface RestaurantParams {
    id: string;
}

import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import { notFound } from 'next/navigation';
import Navbar from '../components/Navbar';
import Badge from '../components/badges/Badge';

// Fetch data for the specific restaurant
export default async function RestaurantDetail({ params }: { params: RestaurantParams }) {
    const { id } = params;
    const restaurants: RestaurantProps[] = getRestaurantsData(); // Type the restaurants array
    const restaurant = restaurants.find((r: RestaurantProps) => r.label === id); // Type the restaurant parameter

    if (!restaurant) {
        notFound();
    }

    return (
      <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8">
        <Navbar />
        <p>{restaurant.label}</p>
        <div>
          {restaurant.badges.map((badge) => (
            <Badge key={badge} label={badge} />
          ))}{" "}
        </div>
      </main>
    );
}

// Generate paths for all restaurants
export async function generateStaticParams() {
    const restaurants: RestaurantProps[] = getRestaurantsData(); // Type the restaurants array
    return restaurants.map((restaurant) => ({
        id: restaurant.label,
    }));
}

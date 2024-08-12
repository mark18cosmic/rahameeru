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
import { FaStar } from "react-icons/fa6";
import MapButton from '../components/buttons/MapButton';
import Review from '../components/buttons/Review';
import { HiOutlineLocationMarker } from 'react-icons/hi';

// Fetch data for the specific restaurant
export default async function RestaurantDetail({ params }: { params: RestaurantParams }) {
    const { id } = params;
    const restaurants: RestaurantProps[] = getRestaurantsData(); // Type the restaurants array
    const restaurant = restaurants.find((r: RestaurantProps) => r.label.toLowerCase() === id); // Type the restaurant parameter

    if (!restaurant) {
        notFound();
    }

    return (
        <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8">
            <div className='flex items-center justify-center'>
                <Image src={restaurant.image} alt={restaurant.label} width={500} height={500} className='rounded-lg object-cover' />
            </div>
            <div className='flex flex-row items-center justify-between'>
                <div>
                    {restaurant.badges.map((badge) => (
                        <Badge key={badge} label={badge} />
                    ))}{" "}
                </div>
                <div>
                    <p className='flex items-center gap-1 text-root-500 text-lg'>{restaurant.ratings} <FaStar /></p>
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                <div>
                    <h3 className='text-xl font-semibold'>{restaurant.label}</h3>
                </div>
                <div>
                    <p className='font-light'>{restaurant.desc}</p>
                </div>
            </div>
            <div className='flex flex-row items-center justify-between'>
                <div>
                    <p className='flex items-center gap-1 flex-row'><HiOutlineLocationMarker /> {restaurant.location}</p>
                </div>
                <div className='flex flex-row gap-2 md:gap-4'>
                    <MapButton />
                    <Review />
                </div>
            </div>
        </main>
    );
}

// Generate paths for all restaurants
export async function generateStaticParams() {
    const restaurants: RestaurantProps[] = getRestaurantsData(); // Type the restaurants array
    return restaurants.map((restaurant) => ({
        id: restaurant.label.toLowerCase(),
    }));
}

// location // buttons
// latest reviews

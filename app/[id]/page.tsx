// Define the type for a restaurant
import Image from 'next/image';
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';
// Define the type for params
interface RestaurantParams {
    id: string;
}

import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import { notFound } from 'next/navigation';
import Badge from '../components/badges/Badge';
import MapButton from '../components/buttons/MapButton';
import Review, { RatingIcon } from '../components/buttons/Review';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import ReviewList from '../components/Review/ReviewList';
import Head from 'next/head';
import { NextSeo } from 'next-seo';

// Fetch data for the specific restaurant
export default async function RestaurantDetail({ params }: { params: RestaurantParams }) {
    const { id } = params;
    const restaurants: RestaurantProps[] = getRestaurantsData(); // Type the restaurants array
    const restaurant = restaurants.find((r: RestaurantProps) => r.label.toLowerCase() === id); // Type the restaurant parameter

    if (!restaurant) {
        notFound();
    }

    return (
        <>
            <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black">
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
                        <RatingIcon key={''} label={''} ratings={restaurant.ratings} image={''} location={''} desc={''} badges={[]} />
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <div>
                        <h3 className='text-xl md:text-2xl font-semibold'>{restaurant.label}</h3>
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
                <div>
                    <ReviewList />
                </div>
            </main></>
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

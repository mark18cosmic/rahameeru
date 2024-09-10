'use client';

import React, { useEffect, useState } from 'react';
import { RestaurantProps } from '../restaurantCard/restaurantCard';
import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import RestaurantCard from '@/app/components/restaurantCard/restaurantCard';
import { Spinner } from '@nextui-org/react'; // Optional: Use a spinner while loading data

interface TitlesProps {
    label: string;
}

const PopularRestaurants: React.FC<TitlesProps> = ({ label }) => {
    const [restaurants, setRestaurants] = useState<RestaurantProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch restaurants data
        const fetchRestaurants = async () => {
            try {
                const data = await getRestaurantsData();
                setRestaurants(data);
            } catch (error) {
                console.error("Error fetching restaurants data:", error);
            } finally {
                setLoading(false);
            }
            console.log(restaurants)
        };

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <div className='flex justify-center items-center'>
                <Spinner /> {/* Optional: Add a loading spinner */}
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 text-black'>
            <div>
                <h2 className='font-semibold text-2xl md:text-4xl'>{label}</h2>
            </div>
            <div className='flex overflow-x-scroll w-full scrollbar-hide gap-4'>
                <div className='flex flex-row gap-4'>
                    {restaurants.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.label} // Use restaurant label as key, but ensure it’s unique
                            label={restaurant.label}
                            image={restaurant.image}
                            ratings={restaurant.ratings}
                            location={restaurant.location}
                            desc={restaurant.desc}
                            badges={restaurant.badges}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PopularRestaurants;

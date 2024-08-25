'use client'

import React from 'react'
import restaurantData from '@/app/api/data.json'
import RestaurantCard, { RestaurantProps } from '../restaurantCard/restaurantCard'
import { getRestaurantsData } from '@/app/utils/getRestaurantData'
import { notFound } from 'next/navigation'

interface TitlesProps {
    label: string
}

const PopularRestaurants: React.FC<TitlesProps> = async ({ label }) => {

    const restaurants: RestaurantProps[] = await getRestaurantsData();
        return (
            <div className='flex flex-col gap-4 text-black'>
                <div>
                    <h2 className='font-semibold text-2xl md:text-4xl'>{label}</h2>
                </div>
                <div className='flex overflow-x-scroll w-full scrollbar-hide gap-4'>
                    <div className='flex flex-row gap-4'>
                        {restaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.label} // Using index as key (although using a unique ID is better if available)
                                label={restaurant.label}
                                image={restaurant.image}
                                ratings={restaurant.ratings} location={restaurant.location} desc={''} badges={[]} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    export default PopularRestaurants
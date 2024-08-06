'use client'

import React from 'react'
import restaurantData from './data.json'
import RestaurantCard from '../restaurantCard/restaurantCard'

interface TitlesProps {
    label: string
}

const PopularRestaurants: React.FC<TitlesProps> = ({ label }) => {
    return (
        <div className='flex flex-col gap-4'>
            <div>
                <h2 className='font-semibold text-2xl md:text-4xl'>{label}</h2>
            </div>
            <div className='flex overflow-x-scroll w-full scrollbar-hide gap-4'>
                <div className='flex flex-nowrap gap-4'>
                    {restaurantData.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.label} // Using index as key (although using a unique ID is better if available)
                            label={restaurant.label}
                            image={restaurant.image}
                            ratings={restaurant.ratings} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PopularRestaurants
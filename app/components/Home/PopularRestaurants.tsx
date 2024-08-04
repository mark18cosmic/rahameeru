'use client'

import React from 'react'
import restaurantData from './data.json'
import RestaurantCard from '../restaurantCard/restaurantCard'

const PopularRestaurants = () => {
    return (
        <div className='flex flex-col gap-4'>
            <h2 className='font-semibold text-2xl md:text-4xl'>Popular Today</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {restaurantData.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.label} // Using index as key (although using a unique ID is better if available)
                        label={restaurant.label}
                        image={restaurant.image}
                        ratings={restaurant.ratings}
                        desc={restaurant.desc} pricings={''} />
                ))}
            </div>
        </div>
    )
}

export default PopularRestaurants
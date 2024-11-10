'use client';

import React, { useEffect, useState } from 'react';
import { RestaurantProps } from '../restaurantCard/restaurantCard';
import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import RestaurantCard from '@/app/components/restaurantCard/restaurantCard';
import { Spinner } from '@nextui-org/react'; // Optional: Use a spinner while loading data

interface TitlesProps {
  label: string;
  filter: string | null; // Accept the filter as a prop
}

const PopularRestaurants: React.FC<TitlesProps> = ({ label, filter }) => {
  const [restaurants, setRestaurants] = useState<RestaurantProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurantsData();
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter restaurants based on the passed filter prop
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (!filter) return true; // If no filter is selected, show all restaurants
    return restaurant.badges?.includes(filter); // Check if the filter is in the restaurant's badges array
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Spinner /> {/* Optional: Add a loading spinner */}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-black">
      <div>
        <h2 className="font-semibold text-xl md:text-3xl">{label}</h2>
      </div>
      <div className="flex overflow-x-scroll w-full scrollbar-hide gap-4">
        <div className="flex flex-row gap-4">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.label} // Use restaurant label as key, but ensure it’s unique
              label={restaurant.label}
              image={restaurant.image}
              ratings={restaurant.ratings}
              location={restaurant.location}
              desc={restaurant.desc}
              badges={restaurant.badges}
              phone={restaurant.phone}
              email={restaurant.email}
            />
          ))}
        </div>
      </div>

      {/* Show message if no restaurants match the filter */}
      {filteredRestaurants.length === 0 && (
        <div className="text-center text-gray-500 mt-4">No restaurants found for this section.</div>
      )}
    </div>
  );
};

export default PopularRestaurants;
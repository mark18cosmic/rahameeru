'use client'

import { useState } from 'react';
import PopularRestaurants from '@/app/components/Home/PopularRestaurants';
import ReviewsList from '@/app/components/Review/ReviewList';

interface RestaurantTabsProps {
    restaurantId: string; // Expecting restaurantId as a prop
}

const RestaurantTabs: React.FC<RestaurantTabsProps> = ({ restaurantId }) => {
    const [activeTab, setActiveTab] = useState('latest-reviews'); // State to manage active tab

    return (
        <div className="flex flex-col gap-4 m-4">
            {/* Tab Headers */}
            <div className="flex justify-around mb-4">
                <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm md:text-lg 
                        ${activeTab === 'latest-reviews' ? 'bg-root-500 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setActiveTab('latest-reviews')}
                >
                    Latest Reviews
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm md:text-lg 
                        ${activeTab === 'popular-restaurants' ? 'bg-root-500 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setActiveTab('popular-restaurants')}
                >
                    Popular Restaurants
                </button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'latest-reviews' && (
                    <div>
                        <ReviewsList restaurantId={restaurantId} />
                    </div>
                )}
                {activeTab === 'popular-restaurants' && (
                    <div>
                        <PopularRestaurants label="Popular Restaurants" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantTabs;

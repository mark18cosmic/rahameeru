'use client'

import { useState } from 'react';
import PopularRestaurants from '@/app/components/Home/PopularRestaurants';
import ReviewsList from '@/app/components/Review/ReviewList';
import { Tabs, Tab } from "@nextui-org/tabs";

interface RestaurantTabsProps {
    restaurantId: string; // Expecting restaurantId as a prop
}

const RestaurantTabs: React.FC<RestaurantTabsProps> = ({ restaurantId }) => {
    const [activeTab, setActiveTab] = useState('latest-reviews'); // State to manage active tab

    return (
        <div className="flex flex-col gap-4 m-4">
            {/* Tab Headers */}
            <Tabs className="flex justify-around mb-4" variant='underlined'>
                <Tab
                    className={`font-medium text-sm md:text-lg 
                        ${activeTab === 'latest-reviews' ? 'text-root-500' : 'text-black'}`}
                    onClick={() => setActiveTab('latest-reviews')}
                >
                    Recent Reviews
                </Tab>
                <Tab
                    className={`rounded-lg font-medium text-sm md:text-lg 
                        ${activeTab === 'popular-restaurants' ? 'text-root-500' : 'text-black'}`}
                    onClick={() => setActiveTab('popular-restaurants')}
                >
                    Popular Restaurants
                </Tab>
            </Tabs>

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

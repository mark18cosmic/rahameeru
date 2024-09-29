'use client'

import { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import PopularRestaurants from '@/app/components/Home/PopularRestaurants';
import ReviewsList from '@/app/components/Review/ReviewList';

const RestaurantTabs: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
    const [activeTab, setActiveTab] = useState('latest-reviews');

    return (
        <div className="flex flex-col gap-4">
            {/* NextUI Tabs Component */}
            <Tabs
                aria-label="Restaurant tabs"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                className="flex justify-around"
                variant="underlined"
            >
                <Tab key="latest-reviews" title="Latest Reviews" className="text-sm md:text-lg">
                    <ReviewsList restaurantId={restaurantId} />
                </Tab>
                <Tab key="popular-restaurants" title="Popular Restaurants" className="text-sm md:text-lg">
                    <PopularRestaurants label="Popular Restaurants" />
                </Tab>
            </Tabs>
        </div>
    );
};

export default RestaurantTabs;

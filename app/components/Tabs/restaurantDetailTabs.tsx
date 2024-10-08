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
                variant="underlined"
                className="flex justify-around"
            >
                <Tab
                    key="latest-reviews"
                    title={<span className={`text-sm md:text-lg`}>Reviews</span>}
                >
                    <ReviewsList restaurantId={restaurantId} />
                </Tab>
                <Tab 
                key="menu"
                title={<span className={`text-sm md:text-lg`}>Menu</span>}
                >
                    <h1>Coming Soon</h1>
                </Tab>
                <Tab
                    key="popular-restaurants"
                    title={<span className={`text-sm md:text-lg`}>You may also like</span>}
                >
                    <PopularRestaurants label="You may also like" />
                </Tab>
            </Tabs>
        </div>
    );
};

export default RestaurantTabs;

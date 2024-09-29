'use client'

import { useState } from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import PopularRestaurants from '@/app/components/Home/PopularRestaurants';
import ReviewsList from '@/app/components/Review/ReviewList';

const RestaurantTabs: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
    const [activeTab, setActiveTab] = useState('latest-reviews');

    return (
        <div className="flex flex-col gap-4 m-4">
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
                    title={
                        <span className={`text-sm md:text-lg ${activeTab === 'latest-reviews' ? 'text-root-500' : 'text-black'}`}>
                            Latest Reviews
                        </span>
                    }
                    className={activeTab === 'latest-reviews' ? 'underline text-root-500' : 'underline text-black'}
                >
                    <ReviewsList restaurantId={restaurantId} />
                </Tab>
                <Tab
                    key="popular-restaurants"
                    title={
                        <span className={`text-sm md:text-lg ${activeTab === 'popular-restaurants' ? 'text-root-500' : 'text-black'}`}>
                            Popular Restaurants
                        </span>
                    }
                    className={activeTab === 'popular-restaurants' ? 'underline text-root-500' : 'underline text-black'}
                >
                    <PopularRestaurants label="Popular Restaurants" />
                </Tab>
            </Tabs>

            {/* Custom underline styling */}
            <style jsx>{`
                .underline {
                    border-bottom: 2px solid transparent; /* Default state */
                }
                .underline.text-root-500 {
                    border-color: var(--nextui-colors-root-500); /* Active state */
                }
                .underline.text-black {
                    border-color: transparent; /* Inactive state */
                }
            `}</style>
        </div>
    );
};

export default RestaurantTabs;

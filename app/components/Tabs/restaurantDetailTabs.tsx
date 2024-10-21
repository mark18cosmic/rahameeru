'use client'

import { useState } from 'react';
import { Tabs, Tab, } from '@nextui-org/react';
import PopularRestaurants from '@/app/components/Home/PopularRestaurants';
import ReviewsList from '@/app/components/Review/ReviewList';
import MenuDropdown from '@/app/components/menu/menuDropdown';

const menuData = [
    {
      category: "Appetizers",
      dishes: [
        {
          name: "Spring Rolls",
          description: "Crispy rolls stuffed with vegetables.",
          price: 5.99,
          image: "/images/spring-rolls.jpg",
        },
        {
          name: "Chicken Wings",
          description: "Spicy grilled chicken wings.",
          price: 8.99,
          image: "/images/chicken-wings.jpg",
        },
      ],
    },
    {
      category: "Main Course",
      dishes: [
        {
          name: "Grilled Salmon",
          description: "Salmon served with a side of vegetables.",
          price: 15.99,
          image: "/images/grilled-salmon.jpg",
        },
        {
          name: "Steak",
          description: "Juicy grilled steak with mashed potatoes.",
          price: 18.99,
          image: "/images/steak.jpg",
        },
      ],
    },
  ];
  


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
                    <MenuDropdown menuItems={menuData} />
                </Tab>
                <Tab
                    key="popular-restaurants"
                    title={<span className={`text-sm md:text-lg`}>You may also like</span>}
                >
                    <PopularRestaurants label="You may also like" filter={null} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default RestaurantTabs;

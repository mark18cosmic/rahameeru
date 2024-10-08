'use client'

import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { getRestaurantsData } from '@/app/utils/getRestaurantData'; // Import your function
import { RestaurantProps } from '../restaurantCard/restaurantCard'; // Adjust the path
import { Input } from '@nextui-org/react';
import { Listbox, ListboxItem } from "@nextui-org/listbox";

export const Search: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RestaurantProps[]>([]);
    const [restaurants, setRestaurants] = useState<RestaurantProps[]>([]);

    // Fetch restaurant data on component mount
    useEffect(() => {
        const fetchData = async () => {
            const restaurantData = await getRestaurantsData();
            setRestaurants(restaurantData);
        };

        fetchData();
    }, []);

    // Initialize Fuse.js with restaurant data once fetched
    const fuse = new Fuse(restaurants, {
        keys: ['label', 'badges'], // Search fields
        includeScore: true,
        threshold: 0.3, // Sensitivity of the search
    });
    const ListboxWrapper = ( children: any ) => (
        <div className="w-full max-w-[960px] border-small px-1 py-2 rounded-small border-default-200 ">
            {children}
        </div>
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchQuery = e.target.value;
        setQuery(searchQuery);

        if (searchQuery.trim()) {
            const fuseResults = fuse.search(searchQuery);
            setResults(fuseResults.map(result => result.item));
        } else {
            setResults([]); // Clear results if query is empty
        }
    };

    return (
        <div className="w-full">
            <Input
                type="text"
                placeholder="Find Restaurant"
                value={query}
                variant='bordered'
                onChange={handleSearch}
                className=""
            />

            <ListboxWrapper>
                <Listbox className="mt-4">
                    {results.length > 0 ? (
                        <div className="bg-white shadow-lg rounded-lg p-4 space-y-2">
                            {results.map((restaurant) => (
                                <ListboxItem
                                    key={restaurant.label}
                                    href={`/${restaurant.label.replace(/\s+/g, '-').toLowerCase()}`}
                                    className="block bg-gray-100 hover:bg-gray-200 transition-colors duration-300 p-2 rounded-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={restaurant.image}
                                            alt={restaurant.label}
                                            className="w-10 h-10 object-cover rounded-full"
                                        />
                                        <span className="font-semibold text-gray-800">
                                            {restaurant.label}
                                        </span>
                                    </div>
                                </ListboxItem>
                            ))}
                        </div>
                    ) : <div className='hidden'></div>}
                </Listbox>

            </ListboxWrapper>
        </div>
    );
};

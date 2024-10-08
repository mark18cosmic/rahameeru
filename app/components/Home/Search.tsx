import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { getRestaurantsData } from '@/app/utils/getRestaurantData'; // Import your function
import { RestaurantProps } from '../restaurantCard/restaurantCard'; // Adjust the path
import { Input } from '@nextui-org/react';


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

            <div className="relative mt-3">

                <div className="absolute z-10 w-full bg-white shadow-lg rounded-lg max-h-64 overflow-y-auto space-y-2">
                    {results.map((restaurant) => (
                        <a
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
                        </a>
                    ))}
                </div>
                )
            </div>

        </div>
    );
};

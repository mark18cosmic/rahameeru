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
      
      <div>
        {results.length > 0 ? (
          results.map((restaurant) => (
            <div key={restaurant.label}>
              <a href={`/${restaurant.label.replace(/\s+/g, '-').toLowerCase()}`}>
                {restaurant.label}
              </a>
            </div>
          ))
        ) : (
          <p className='hidden'>No results found</p>
        )}
      </div>
    </div>
  );
};

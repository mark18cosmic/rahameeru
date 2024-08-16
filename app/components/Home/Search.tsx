"use client"

import React from 'react'
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { BiSearch } from 'react-icons/bi';
import restaurants from "@/app/api/data.json"
import Link from 'next/link';
import { RestaurantProps } from '../restaurantCard/restaurantCard';

export const Search: React.FC<RestaurantProps> = ({ label }) => {
    return (
        <div className="w-full">
            <Autocomplete
                placeholder="Find Restaurant"
                variant="bordered"
                allowsCustomValue
                startContent={<BiSearch />}
                selectorIcon={""}
                className='bg-white'
            >
                {restaurants.map((restaurant) => (
                    <Link href={`/${encodeURIComponent(label.replace(/\s+/g, '-').toLowerCase())}`} key={restaurant.key}>
                        <AutocompleteItem key={restaurant.key} value={restaurant.key}>
                            {restaurant.label}
                        </AutocompleteItem>
                        </Link>
                ))}
        </Autocomplete>
        </div >
    )
}


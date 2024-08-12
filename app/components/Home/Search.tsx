"use client"

import React from 'react'
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { BiSearch } from 'react-icons/bi';
import restaurants from "@/app/api/data.json"
import Link from 'next/link';
import { RestaurantProps } from '../restaurantCard/restaurantCard';

export const Search: React.FC<RestaurantProps> = ({label}) => {
    return (
        <div className="w-full">
            <Autocomplete
                placeholder="Find Restaurant"
                variant="bordered"
                allowsCustomValue
                startContent={<BiSearch />}
                selectorIcon={""}
            >
                {restaurants.map((restaurant) => (
                    <AutocompleteItem key={restaurant.key} value={restaurant.key}>
                        <Link href={`/${label}`}>
                            {restaurant.label}
                        </Link>
                    </AutocompleteItem>
                ))}
            </Autocomplete>
        </div>
    )
}


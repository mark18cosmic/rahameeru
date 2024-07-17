"use client"

import React from 'react'
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { BiSearch } from 'react-icons/bi';

const restaurants = [
  { value: '1', label: 'Restaurant One' },
  { value: '2', label: 'Restaurant Two' },
  { value: '3', label: 'Restaurant Three' },
  { value: '4', label: 'Dinemore' },

];

export default function Search() {
    return (
        <div className="w-full">
            <Autocomplete
                label="Find Restaurant"
                variant="bordered"
                allowsCustomValue
                startContent={<BiSearch />}
            >
                {restaurants.map((restaurant) => (
                    <AutocompleteItem key={restaurant.value} value={restaurant.value}>
                        {restaurant.label}
                    </AutocompleteItem>
                ))}
            </Autocomplete>
        </div>
    )
}


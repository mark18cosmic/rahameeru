"use client"

import React from 'react'
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { BiSearch } from 'react-icons/bi';
import restaurants from "@/app/api/data.json"


interface Restaurant {
    label: string;
    key: string;
    pricings: string;
    ratings: string;
    desc: string;
}

export default function Search() {
    return (
        <div className="w-full">
            <Autocomplete
                label="Find Restaurant"
                variant="bordered"
                allowsCustomValue
                startContent={<BiSearch />}
                selectorIcon={""}
            >
                {restaurants.map((restaurant) => (
                    <AutocompleteItem key={restaurant.key} value={restaurant.key}>
                        {restaurant.label}
                    </AutocompleteItem>
                ))}
            </Autocomplete>
        </div>
    )
}


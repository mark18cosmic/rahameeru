'use client'

import React from 'react'
import { Card, CardBody, } from '@nextui-org/react'
import Image from 'next/image'
import { FaStar } from "react-icons/fa6";
import Badge from '@/app/components/badges/Badge'
import { HiOutlineLocationMarker } from "react-icons/hi";
import Link from 'next/link';
import { getRestaurantsData } from '@/app/utils/getRestaurantData';

export interface RestaurantProps {
    label: string;
    key: string;
    ratings: number;
    image: string;
    location: string;
    desc: string;
    badges: string[];
}

const RestaurantCard: React.FC<RestaurantProps> = async ({ label, ratings, image, location, }) => {

    const restaurant: RestaurantProps[] = await getRestaurantsData();

    return (
        <Link href={`/${encodeURIComponent(label.replace(/\s+/g, '-').toLowerCase())}`}>
            <Card isPressable isHoverable className='w-[200px] shadow-sm md:w-[300px]'>
                <CardBody>
                    <div className='flex flex-col gap-2'>
                        <div className='flex justify-center items-center'>
                            <Image src={image} alt='null' width={180} height={150} className='object-cover rounded-xl md:w-full' />
                        </div>
                        <div className='flex flex-col my-2'>
                            <div className='flex flex-row mt-1 p-1 gap-2 items-center justify-between mb-2'>
                                <h2 className="font-semibold md:text-large text-medium">{label}</h2>
                                <p className="text-medium md:text-large flex flex-row items-center text-root-500">{ratings}<FaStar /></p>
                            </div>
                            <div className='flex flex-row justify-between'>
                                <span className='flex flex-row items-center gap-1 md:text-medium text-sm'><HiOutlineLocationMarker /> {location}</span>
                                <div className='flex justify-end'>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Link>
    )
}


export default RestaurantCard


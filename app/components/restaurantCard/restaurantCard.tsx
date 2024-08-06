'use client'

import React from 'react'
import { Card, CardBody, } from '@nextui-org/react'
import Image from 'next/image'
import { FaStar } from "react-icons/fa6";
import ReviewButton from '@/app/components/buttons/Review'

interface RestaurantProps {
    label: string;
    key: string;
    ratings: string;
    image: string;
}

const RestaurantCard: React.FC<RestaurantProps> = ({ label, ratings,  image }) => {
    return (
        <Card isPressable isHoverable className='w-[200px] md:w-[300px]'>
            <CardBody>
                <div className='flex flex-col gap-2'>
                    <div className='flex justify-center items-center'>
                        <Image src={image} alt='null' width={180} height={150} className='object-cover rounded-xl md:w-full' />
                    </div>
                    <div className='flex flex-col my-2'>
                        <div className='flex flex-row mt-1 p-1 gap-2 items-center justify-between mb-2'>
                            <h2 className="font-semibold md:text-large text-sm">{label}</h2>
                            <p className="text-sm md:text-large flex flex-row items-center gap-1 text-root-500">{ratings}<FaStar /></p>
                        </div>
                        <div className='flex justify-end'>
                            <ReviewButton />
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}


export default RestaurantCard


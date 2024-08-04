'use client'

import React from 'react'
import { Card, CardBody, } from '@nextui-org/react'
import Image from 'next/image'
import { FaStar } from "react-icons/fa6";
import ReviewButton from '@/app/components/buttons/Review'

interface RestaurantProps {
    label: string;
    key: string;
    pricings: string;
    ratings: string;
    desc: string;
    image: string;
}

const RestaurantCard: React.FC<RestaurantProps> = ({ label, ratings, desc, image }) => {
    return (
        <Card isPressable isHoverable>
            <CardBody>
                <div className='flex flex-col'>
                    <div>
                        <Image src={image} alt='null' width={150} height={100} className='object-cover rounded-xl md:w-full' />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-row mt-1 p-1 gap-2 justify-between mb-2'>
                            <h2 className="font-semibold md:text-large text-small">{label}</h2>
                            <p className="text-medium md:text-large flex flex-row items-center gap-1 text-root-500">{ratings}<FaStar /></p>
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


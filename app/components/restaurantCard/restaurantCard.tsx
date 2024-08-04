import React from 'react'
import { Card, CardBody, } from '@nextui-org/react'
import Image from 'next/image'
import { FaStar } from "react-icons/fa6";

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
                        <Image src={image} alt='null' width={150} height={100} className='object-cover' />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-row p-2 justify-between'>
                            <h2 className="font-semibold">{label}</h2>
                            <p className="text-medium flex flex-row items-center gap-1">{ratings}<FaStar /></p>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}


export default RestaurantCard


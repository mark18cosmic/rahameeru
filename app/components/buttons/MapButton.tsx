import { Button } from '@nextui-org/react'
import Link from 'next/link';
import React from 'react'
import { FaPhoneAlt } from "react-icons/fa";
import { InfoProps } from './Info';

const MapButton: React.FC<InfoProps> = (phone) => {
    return (
        <div className='md:w-full'>
            <Link href={`tel:${phone}`}>
                <Button className='bg-white border-black border text-black text-sm md:text-base font-semibold flex flex-row items-center'>Order <FaPhoneAlt /></Button>
            </Link>
        </div>
    )
}

export default MapButton

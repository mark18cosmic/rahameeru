import { Button } from '@nextui-org/react'
import React from 'react'
import { FaPhoneAlt } from "react-icons/fa";
const MapButton = () => {
    return (
        <div className='md:w-full'>
            <Button className='bg-white border-black border text-black text-sm md:text-base font-semibold flex flex-row items-center'>Call <FaPhoneAlt /></Button>

        </div>
    )
}

export default MapButton

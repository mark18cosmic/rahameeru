import { Button } from '@nextui-org/react'
import React from 'react'
import { FaLocationArrow } from "react-icons/fa";

const MapButton = () => {
    return (
        <div className='md:w-full'>
            <Button className='bg-white border-black border text-black md:text-large font-semibold flex flex-row items-center'>Find in Maps <FaLocationArrow /></Button>

        </div>
    )
}

export default MapButton
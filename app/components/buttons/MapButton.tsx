import { Button } from '@nextui-org/react'
import React from 'react'
import { TiLocationArrowOutline } from "react-icons/ti";
const MapButton = () => {
    return (
        <div className='md:w-full'>
            <Button className='bg-white border md:text-large font-semibold flex flex-row items-center'><TiLocationArrowOutline size={25} /> Find in Maps</Button>

        </div>
    )
}

export default MapButton
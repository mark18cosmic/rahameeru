import { Button } from '@nextui-org/react'
import React from 'react'
import { TiLocationArrowOutline } from "react-icons/ti";
const MapButton = () => {
  return (
    <Button className='bg-white border md:text-large font-semibold flex flex-row items-center'><TiLocationArrowOutline /> Find in Maps</Button>
    )
}

export default MapButton
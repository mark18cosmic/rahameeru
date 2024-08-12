import { Button } from '@nextui-org/react'
import React from 'react'
import { TiLocationArrowOutline } from "react-icons/ti";
const MapButton = () => {
  return (
    <Button className='bg-white border font-semibold flex flex-row items-center'><TiLocationArrowOutline size={10}/> Find in Maps</Button>
    )
}

export default MapButton
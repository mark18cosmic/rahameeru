import { Button } from '@nextui-org/react'
import React from 'react'
import { HiOutlineLocationMarker } from 'react-icons/hi'

const MapButton = () => {
  return (
    <Button className='bg-white border md:text-large font-semibold flex flex-row items-center'><HiOutlineLocationMarker /> Find in Maps</Button>
    )
}

export default MapButton
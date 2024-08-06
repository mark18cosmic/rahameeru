'use client'

import { Button } from '@nextui-org/react'
import React from 'react'
import { FaArrowRight } from "react-icons/fa6";

function ReviewButton() {
    return (
        <div className='md:w-full'>
            <Button className='bg-root-500 text-white md:text-large font-semibold flex flex-row items-center'>Review <FaArrowRight /></Button>
        </div>
    )
}

export default ReviewButton
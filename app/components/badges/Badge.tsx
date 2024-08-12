'use client'

import { Chip } from '@nextui-org/react'
import React from 'react'

interface BadgeProps {
    label: string;  // Ensure label is typed as string
}

const Badge: React.FC<BadgeProps> = ({ label }) => {
    return (
        <Chip className='bg-root-300 mx-1 md:mx-4 my-1' size='md'>
            {label}
        </Chip>
    )
}

export default Badge
'use client'

import Link from 'next/link'
import React from 'react'
import logo from "@/public/rahameeru-high-resolution-logo-transparent.png"
import Image from 'next/image'
import { Avatar } from '@nextui-org/react'

function Navbar() {
    return (
        <div className='flex flex-row justify-between items-center'>
            <div>
                <Link href="/">
                    <Image src={logo} alt='RahaMeeru' width={160} />
                </Link>
            </div>
            <div>
                <Avatar name='K'/>
            </div>
        </div>
    )
}

export default Navbar
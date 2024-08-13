'use client'

import Link from 'next/link'
import React from 'react'
import logo from "@/public/rahameeru-high-resolution-logo-transparent.png"
import Image from 'next/image'
import { Avatar } from '@nextui-org/react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { Search } from './Home/Search'

function Navbar() {
    return (
        <div className='flex flex-row justify-between gap-3 md:gap-6 items-center m-4 md:m-6'>
            <div>
                <Link href="/">
                    <Image src={logo} alt='RahaMeeru' width={160} />
                </Link>
            </div>
            <div className='md:w-full'>
                <Search key={""} label={""} ratings={""} image={""} location={""} desc={""} badges={[]} />

            </div>
            <div className='m-1'>
                <Dropdown>
                    <DropdownTrigger>
                        <Avatar className='rounded-full' />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                        <DropdownItem key="profile">Profile</DropdownItem>
                        <DropdownItem key="myreviews">My Reviews</DropdownItem>
                        <DropdownItem key="request">Request Restaurant</DropdownItem>
                        <DropdownItem key="contact">
                            Contact us
                        </DropdownItem>
                        <DropdownItem key="logout" className='text-root-500' color='danger'>
                            Log Out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    )
}

export default Navbar
'use client'

import Link from 'next/link'
import React from 'react'
import logo from "@/public/rahameeru-high-resolution-logo-transparent.png"
import Image from 'next/image'
import { Avatar } from '@nextui-org/react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";

function Navbar() {
    return (
        <div className='flex flex-row justify-between items-center'>
            <div>
                <Link href="/">
                    <Image src={logo} alt='RahaMeeru' width={160} />
                </Link>
            </div>
            <Dropdown>
                <DropdownTrigger>
                    <Avatar />
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="profile">Profile</DropdownItem>
                    <DropdownItem key="myreviews">My Reviews</DropdownItem>
                    <DropdownItem key="request">Request Restaurant</DropdownItem>
                    <DropdownItem key="contact">
                        Contact us
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default Navbar
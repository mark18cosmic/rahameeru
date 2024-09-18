'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import logo from "@/public/rahameeruLogo.png"
import Image from 'next/image'
import { Avatar } from '@nextui-org/react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Search } from './Home/Search'
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/firebase/firebaseConfig'
import AuthButtons from '@/app/components/buttons/Login'; // Import your sign-in/up buttons component
import { logout } from '../api/auth/logout'
import { useRouter } from 'next/navigation'

function Navbar() {
    // Use 'User | null' to properly type the state
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);
    const handleLogout = async () => {
        try {
            await logout();
            setUser(null); // Clear user state
            router.push('/'); // Redirect to the homepage after logout
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className='flex flex-row justify-between mb-3 gap-3 md:gap-6 items-center m-4 md:m-6'>
            {/* Logo */}
            <div>
                <Link href={"/"}>
                    <Image src={logo} alt='RahaMeeru' width={150} className='' />
                </Link>
            </div>

            {/* Search Bar */} {user ? (
                <div className='md:w-full'>
                    <Search key={""} label={""} ratings={0} image={""} location={""} desc={""} badges={[]} />
                </div>) : (
                <div className='md:w-full hidden md:flex'>
                    <Search key={""} label={""} ratings={0} image={""} location={""} desc={""} badges={[]} />
                </div>)}

            {/* User Avatar or Auth Buttons */}
            <div className='m-1'>
                {user ? (
                    <Dropdown>
                        <DropdownTrigger>
                            <Avatar className='rounded-full cursor-pointer' src={''} />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions">
                            <DropdownItem key="profile">Profile</DropdownItem>
                            <DropdownItem key="myreviews">My Reviews</DropdownItem>
                            <DropdownItem key="request">Request Restaurant</DropdownItem>
                            <DropdownItem key="contact">Contact us</DropdownItem>
                            <DropdownItem key="logout" className='text-root-500' color='danger' onClick={handleLogout}>
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <AuthButtons />  // Show sign-in/up buttons when no user is logged in
                )}
            </div>
        </div>
    )
}

export default Navbar;

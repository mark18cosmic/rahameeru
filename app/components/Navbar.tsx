'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import logo from "@/public/rahameeru-high-resolution-logo-transparent.png"
import Image from 'next/image'
import { Avatar } from '@nextui-org/react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Search } from './Home/Search'
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthButtons from '@/app/components/buttons/Login'; // Import your sign-in/up buttons component

function Navbar() {
     // Use 'User | null' to properly type the state
     const [user, setUser] = useState<User | null>(null);

     useEffect(() => {
         const auth = getAuth();
         const unsubscribe = onAuthStateChanged(auth, (user) => {
             if (user) {
                 setUser(user); // Set the signed-in user, which is of type 'User'
             } else {
                 setUser(null); // Set state back to 'null' if no user is signed in
             }
         });
 
         // Clean up the subscription on component unmount
         return () => unsubscribe();
     }, []);
 
     return (
         <div className='flex flex-row justify-between gap-3 md:gap-6 items-center m-4 md:m-6'>
             {/* Logo */}
             <div>
                 <Link href="/">
                     <Image src={logo} alt='RahaMeeru' width={160} />
                 </Link>
             </div>
 
             {/* Search Bar */}
             <div className='md:w-full'>
                 <Search key={""} label={""} ratings={""} image={""} location={""} desc={""} badges={[]} />
             </div>
 
             {/* User Avatar or Auth Buttons */}
             <div className='m-1'>
                 {user ? (
                     <Dropdown>
                         <DropdownTrigger>
                             <Avatar className='rounded-full cursor-pointer' src={user.photoURL || undefined} />
                         </DropdownTrigger>
                         <DropdownMenu aria-label="Static Actions">
                             <DropdownItem key="profile">Profile</DropdownItem>
                             <DropdownItem key="myreviews">My Reviews</DropdownItem>
                             <DropdownItem key="request">Request Restaurant</DropdownItem>
                             <DropdownItem key="contact">Contact us</DropdownItem>
                             <DropdownItem key="logout" className='text-root-500' color='danger'>
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

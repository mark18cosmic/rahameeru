'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import logo from "@/public/rahameeru-high-resolution-logo-transparent.png"
import Image from 'next/image'
import { Avatar } from '@nextui-org/react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Search } from './Home/Search'
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/firebase/firebaseConfig'
import AuthButtons from '@/app/components/buttons/Login'; // Import your sign-in/up buttons component
import { logout } from '../api/auth/logout'
import router from 'next/router'

function Navbar() {
     // Use 'User | null' to properly type the state
     const [user, setUser] = useState<User | null>(null);

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
         <div className='flex flex-row justify-between gap-3 md:gap-6 items-center m-4 md:m-6'>
             {/* Logo */}
             <div>
                 <Link href="/">
                     <Image src={logo} alt='RahaMeeru' width={160} />
                 </Link>
             </div>
 
             {/* Search Bar */} {user ? (<div />) : (
             <div className='md:w-full'>
                 <Search key={""} label={""} ratings={""} image={""} location={""} desc={""} badges={[]} />
             </div>)}
 
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

import { Button } from '@nextui-org/react'
import Link from 'next/link'
import React from 'react'

const AuthButtons = () => {
    return (
        <div className='md:w-full flex flex-row gap-2'>
            <Link href={"/login"}>
                <Button className='bg-white border border-black text-black md:text-large font-semibold flex flex-row items-center'>Login</Button>
            </Link>
            <Link href={"/signup"}>
                <Button className='bg-root-500 text-white md:text-large font-semibold flex flex-row items-center'>Sign up</Button>
            </Link>
        </div>)
}

export default AuthButtons
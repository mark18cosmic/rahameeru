import { Button } from '@nextui-org/react'
import React from 'react'

const AuthButtons = () => {
    return (
        <div className='md:w-full flex flex-row'>
            <Button className='bg-white border md:text-large font-semibold flex flex-row items-center'>Login</Button>
            <Button className='bg-root-500 text-white md:text-large font-semibold flex flex-row items-center'>Sign up</Button>
        </div>)
}

export default AuthButtons
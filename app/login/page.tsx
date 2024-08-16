import React from 'react'
import SignIn from '../components/authentication/Login'

const LoginPage = () => {
  return (
    <>
    <main className='m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black'>
        <div className='flex justify-center'>
            <SignIn />
        </div>
    </main>
    </>
  )
}

export default LoginPage
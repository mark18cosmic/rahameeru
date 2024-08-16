import React from 'react'
import SignIn from '../components/authentication/Login'

const LoginPage = () => {
  return (
    <>
    <main className='m-4 md:m-6 flex justify-center flex-col gap-5 md:gap-8 text-black min-h-screen'>
        <div className='flex justify-center items-center'>
            <SignIn />
        </div>
    </main>
    </>
  )
}

export default LoginPage
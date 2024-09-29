import React from 'react'
import SignIn from '../components/authentication/Login'
import Navbar from '../components/Navbar'

const LoginPage = () => {
  return (
    <>
      {/* <Navbar /> */}
      <main className='h-full m-4 md:m-6 justify-center items-center flex flex-col gap-5 md:gap-8 text-black'>
        <div className='flex min-h-full items-center justify-center p-5'>
          <SignIn />
        </div>
      </main>
    </>
  )
}

export default LoginPage
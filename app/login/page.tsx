import React from 'react'
import SignIn from '../components/authentication/Login'
import Navbar from '../components/Navbar'

const LoginPage = () => {
  return (
    <>
      {/* <Navbar /> */}
      <main className='min-h-screen m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black'>
        <div className='flex items-center justify-center p-5'>
          <SignIn />
        </div>
      </main>
    </>
  )
}

export default LoginPage
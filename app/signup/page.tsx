import React from 'react'
import SignUp from '../components/authentication/Signup'
import Navbar from '../components/Navbar'

const SignupPage = () => {
  return (
    <>
      {/* <Navbar /> */}
      <main className='h-full m-4 md:m-6 min-h-full flex flex-col gap-5 md:gap-8 text-black'>
        <div className='flex min-h-full p-5 items-center justify-center'>
          <SignUp />
        </div>
      </main>
    </>
  )
}

export default SignupPage
import React from 'react'
import SignUp from '../components/authentication/Signup'

const SignupPage = () => {
  return (
    <>
    <main className='m-4 md:m-6 flex flex-col justify-center min-h-screen gap-5 md:gap-8 text-black'>
        <div className='flex justify-center'>
            <SignUp />
        </div>
    </main>
    </>
  )
}

export default SignupPage
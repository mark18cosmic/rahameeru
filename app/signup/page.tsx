import React from 'react'
import SignUp from '../components/authentication/Signup'
import Navbar from '../components/Navbar'

const SignupPage = () => {
  return (
    <>
      {/* <Navbar /> */}
      <main className='min-h-screen flex items-center justify-center text-black'>
        <div className=''>
          <SignUp />
        </div>
      </main>
    </>
  )
}

export default SignupPage
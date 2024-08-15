'use client'

import { useState } from 'react';
import { logIn } from '@/app/api/auth/login';
import { Button, Input } from '@nextui-org/react';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await logIn(email, password);
      alert('Sign-in successful!');
    } catch (error) {
      console.error(error);
      alert('Error during sign-in');
    }
  };

  return (
    <div className='flex flex-col gap-3'>
      <Input className='bg-white' labelPlacement='outside' label="Email" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <Input className='bg-white' labelPlacement='outside' label="Password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleSignIn} className='bg-root-500 text-white  md:text-large font-semibold flex flex-row items-center'>Signup</Button>
    </div>
  );
};

export default SignIn;
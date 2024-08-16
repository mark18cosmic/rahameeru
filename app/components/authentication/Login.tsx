'use client'

import { useState } from 'react';
import { logIn } from '@/app/api/auth/login';
import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();


  const handleSignIn = async () => {
    try {
      await logIn(email, password);
      alert('Sign-in successful!');
      router.back()
    } catch (error) {
      console.error(error);
      alert('Error during sign-in');
    }
  };

  return (
    <Card className='w-full md:w-1/2'>
      <CardHeader className='flex justify-center'>
        <h2 className='text-xl md:text-2xl font-semibold'>Login</h2>
      </CardHeader>
      <CardBody>
        <div className='flex flex-col justify-center gap-3'>
          <Input variant='bordered' labelPlacement='outside' label="Email" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <Input variant='bordered' labelPlacement='outside' label="Password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleSignIn} className='bg-root-500 text-white  md:text-large font-semibold flex flex-row items-center'>Login</Button>
          <Link href={''} className='text-root-500 text-center'>Forgot Password</Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default SignIn;
'use client'

import { useState } from 'react';
import { signUp } from '@/app/api/auth/signup';
import { Button, Card, CardBody, CardHeader, Checkbox, Input, Tooltip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { BsQuestionCircle } from "react-icons/bs";
import Link from 'next/link';

export const SignUp = () => {
    const [username, setUsername] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSignUp = async () => {
        try {
            await signUp(email, password, username); // Make sure your signUp function also supports username if necessary
            alert('Sign-up successful!');

            // Redirect to previous page after successful sign-up
            router.push('/'); // This takes the user to the previous page
        } catch (error) {
            console.error(error);
            alert('Error during sign-up');
        }
    };

    return (
        <Card className="w-full max-w-xl flex flex-col justify-center items-center p-6">
  <CardBody>
    <CardHeader className="flex flex-col gap-1 justify-center items-center mb-4">
      <h2 className="text-2xl md:text-3xl font-semibold">Create Account</h2>
      <p>Create an account start ordering and reviewing.</p>
    </CardHeader>
    <div className="flex flex-col gap-4">
      <Input 
        variant="bordered" 
        label="Username" 
        labelPlacement="outside" 
        type="text" 
        placeholder="Username" 
        onChange={(e) => setUsername(e.target.value)} 
        className="w-full"
      />
      <Input 
        variant="bordered" 
        label="Email" 
        labelPlacement="outside" 
        type="email" 
        placeholder="Email" 
        onChange={(e) => setEmail(e.target.value)} 
        className="w-full"
      />
      <Input 
        variant="bordered" 
        label={
          <div className="flex gap-2 items-center">
            Password
            <Tooltip
              placement="top"
              content={
                <div className="px-2 py-1 text-sm">
                  Password should be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.
                </div>
              }
            >
              <span className="cursor-pointer">
                <BsQuestionCircle />
              </span>
            </Tooltip>
          </div>
        } 
        labelPlacement="outside" 
        type="password" 
        placeholder="Password" 
        onChange={(e) => setPassword(e.target.value)} 
        className="w-full"
      />
      <Button 
        onClick={handleSignUp} 
        className="bg-root-500 text-white text-lg md:text-xl font-semibold py-2 rounded"
      >
        Sign Up
      </Button>
      <div className="text-center mt-3">
        <p className="text-sm md:text-base">
          Already have an account? 
          <Link href="/login" className="text-root-500 font-semibold ml-1">Login</Link>
        </p>
      </div>
    </div>
  </CardBody>
</Card>

    );
};

export default SignUp;
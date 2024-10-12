'use client'

import { useState } from 'react';
import { logIn } from '@/app/api/auth/login';
import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GoogleSignIn from './googleSignin';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();


  const handleSignIn = async () => {
    try {
      await logIn(email, password);
      alert('Sign-in successful!');
      router.push('/')
    } catch (error) {
      console.error(error);
      alert('Error during sign-in');
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-6 shadow-xl rounded-lg">
    <CardHeader className="flex justify-center mb-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Login</h2>
    </CardHeader>
    <CardBody>
      <div className="flex flex-col gap-4">
        {/* Email Input */}
        <Input
          variant="bordered"
          labelPlacement="outside"
          label="Email"
          type="email"
          placeholder="Enter your email"
          className="p-3 rounded-md"
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Password Input */}
        <Input
          variant="bordered"
          labelPlacement="outside"
          label="Password"
          type="password"
          placeholder="Enter your password"
          className="p-3 rounded-md"
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* Login Button */}
        <Button
          onClick={handleSignIn}
          className="bg-root-500 text-white text-lg font-semibold rounded-lg py-3"
        >
          Login
        </Button>

        {/* Account creation link */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-root-500 font-semibold">
              Create One
            </Link>
          </p>
        </div>

        <br />
        {/* Uncomment GoogleSignIn when ready */}
        {/* <GoogleSignIn /> */}
      </div>
    </CardBody>
  </Card>
  );
};

export default SignIn;
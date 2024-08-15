'use client'

import { useState } from 'react';
import { signUp } from '@/app/api/auth/signup';
import { Button, Input } from '@nextui-org/react';

export const SignUp = () => {
    const [username, setUsername] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        try {
            await signUp(email, password, username);
            alert('Sign-up successful!');
        } catch (error) {
            console.error(error);
            alert('Error during sign-up');
        }
    };

    return (
        <div className='flex flex-col gap-3'>
            <Input type="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <Input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={handleSignUp} className='bg-root-500 text-white  md:text-large font-semibold flex flex-row items-center'>Signup</Button>
        </div>
    );
};

export default SignUp;
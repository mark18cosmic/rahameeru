'use client'

import { useState } from 'react';
import { signUp } from '@/app/api/auth/signup';
import { Button, Card, CardBody, CardHeader, Input, Tooltip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { BsQuestionCircle } from "react-icons/bs";

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
            router.back(); // This takes the user to the previous page
        } catch (error) {
            console.error(error);
            alert('Error during sign-up');
        }
    };

    return (
        <Card className='w-1/2'>
            <CardBody>
                <CardHeader className='flex justify-center items-center'>
                    <h2 className='text-xl md:text-2xl font-semibold'>Create an Account</h2>
                </CardHeader>
                <div className='flex flex-col gap-3'>
                    <Input variant='bordered' label="Username" labelPlacement='outside' type="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    <Input variant='bordered' label="Email" labelPlacement='outside' type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                    <Input variant='bordered' label={
                        <div className="flex gap-2 items-center">
                            Password
                            <Tooltip
                                placement="top"
                                content={
                                    <div className="px-1 py-2">
                                        <div className="">Password should be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number.</div>
                                    </div>
                                }
                            >
                                <span className="cursor-pointer">
                                    <BsQuestionCircle />
                                </span>
                            </Tooltip>
                        </div>
                    } labelPlacement='outside' type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <Button onClick={handleSignUp} className='bg-root-500 text-white  md:text-large font-semibold flex flex-row items-center'>Signup</Button>
                </div>
            </CardBody>
        </Card>
    );
};

export default SignUp;
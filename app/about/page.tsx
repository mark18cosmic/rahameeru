// pages/about.tsx

import { Button } from '@nextui-org/react';
import Image from 'next/image';
import React from 'react';

const About = () => {
    return (
        <div className="bg-white py-12 px-6 lg:px-24">
            <div className="container mx-auto">
                <h1 className="text-4xl font-extrabold mb-6 text-center">About Rahameeru</h1>
                <p className="text-lg text-gray-600 mb-8 text-center">
                    At Rahameeru, we are passionate about connecting food lovers with the best dining experiences in the Maldives. 
                    Whether you&apos;re looking for a cozy cafe, a luxury restaurant, or hidden gems, we&apos;ve got you covered!
                </p>
                <div className="flex justify-center mb-8">
                    <Image
                        src="/public/banner/alex-haney-CAhjZmVk5H4-unsplash.jpg" // Replace with your image path
                        alt="About Us"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-lg"
                    />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-6">
                    Our mission is to provide a platform where users can discover, rate, and share their dining experiences. 
                    We aim to support local restaurants and help you find the perfect spot for any occasion!
                </p>
                <h2 className="text-2xl font-bold mb-4">Join Us</h2>
                <p className="text-gray-600 mb-6">
                    Join our community today by creating an account and start exploring the wonderful culinary landscape of the Maldives. 
                    Share your favorite places and connect with fellow food enthusiasts!
                </p>
                <div className="flex justify-center">
                    <Button className='bg-root-500' size="lg" href="/login">
                        Get Started
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default About;

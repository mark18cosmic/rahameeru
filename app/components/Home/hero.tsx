'use client';

import Image from 'next/image';
import React from 'react';
import HeroImage from "@/public/banner/alex-haney-CAhjZmVk5H4-unsplash.jpg"
import { Button } from '@nextui-org/react';
import { FaArrowRight } from 'react-icons/fa6';
import { FaPhoneAlt } from 'react-icons/fa';

const Hero = () => {
    return (
        <section className="bg-white">
            <div className="flex justify-between max-w-screen-xl px-4 py-8 m-4 md:m-6 lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
                {/* Left side: Heading and Buttons */}
                <div className="mr-auto place-self-center lg:col-span-7">
                    <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl">
                        <span className='text-root-800'>Discover </span>the Best Restaurants in the Maldives
                    </h1>
                    <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                        Rahameeru helps you explore top-rated dining spots, read authentic reviews, and share your experiences. Join us in discovering the best places to eat around the islands!
                    </p>
                    <div className='flex gap-2 md:gap-4'>
                        <Button
                            className="bg-root-500 text-white md:text-base text-sm font-semibold flex flex-row items-center"
                        >Get started<FaArrowRight /></Button>

                        <Button className='bg-white border-black border text-black text-sm md:text-base font-semibold flex flex-row items-center'>Contact us</Button>
                    </div>


                </div>

                {/* Right side: Image */}
                <div className="hidden lg:mt-0 lg:col-span-5 rounded-xl lg:flex">
                    <Image src={HeroImage} alt="restaurant mockup" />
                </div>
            </div>
        </section>
    );
};

export default Hero;

'use client';

import Image from 'next/image';
import React from 'react';
import HeroImage from "@/public/banner/alex-haney-CAhjZmVk5H4-unsplash.jpg"
import { Button } from '@nextui-org/react';
import { FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

const Hero = () => {
    return (
        <section className="bg-white">
            <div className="container mx-auto px-4 py-8 lg:py-16 flex flex-col lg:flex-row lg:items-center">
                {/* Left side: Text and Buttons */}
                <div className="w-full lg:w-1/2">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl">
                        Discover the Best Restaurants in the Maldives
                    </h1>
                    <p className="mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                        Rahameeru helps you explore top-rated dining spots, read authentic reviews, and share your experiences. Join us in discovering the best places to eat around the islands!
                    </p>
                    <div className='flex gap-2 md:gap-4'>
                        <Link href='/login'>
                            <Button className="bg-root-500 text-white md:text-base text-sm font-semibold flex flex-row items-center">
                                Get started <FaArrowRight />
                            </Button>
                        </Link>
                        <Link href={"/contact-us"}>
                            <Button className='bg-white border-black border text-black text-sm md:text-base font-semibold flex flex-row items-center'>
                                Contact us
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Right side: Image Grid */}
                <div className="hidden lg:grid lg:w-1/2 grid-cols-3 gap-4 ml-10">
                    <div className="grid gap-4">
                        <div>
                            <Image className="h-auto max-w-full rounded-lg hover:animate-pulse" src="https://images.pexels.com/photos/8104578/pexels-photo-8104578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Restaurant Image" />
                        </div>
                        <div>
                            <Image className="h-auto max-w-full rounded-lg hover:animate-pulse" src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Restaurant Image" />
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <div>
                            <Image className="h-auto max-w-full rounded-lg hover:animate-pulse" src="https://images.pexels.com/photos/64208/pexels-photo-64208.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Restaurant Image" />
                        </div>
                        <div>
                            <Image className="h-auto max-w-full rounded-lg hover:animate-pulse" src="https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Restaurant Image" />
                        </div>
                        <div>
                            <Image className="h-auto max-w-full rounded-lg hover:animate-pulse" src="https://images.pexels.com/photos/808941/pexels-photo-808941.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Restaurant Image" />
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <div>
                            <Image className="h-auto max-w-full rounded-lg hover:animate-pulse" src="https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
                        </div>
                        <div>
                            <Image className="h-auto max-w-full rounded-lg hover:animate-pulse" src="https://images.pexels.com/photos/936611/pexels-photo-936611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

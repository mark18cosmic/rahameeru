'use client';

import Image from 'next/image';
import React from 'react';
import HeroImage from "@/public/banner/alex-haney-CAhjZmVk5H4-unsplash.jpg"
import { Button } from '@nextui-org/react';
import { FaArrowRight } from 'react-icons/fa6';
import { FaPhoneAlt } from 'react-icons/fa';
import Link from 'next/link';

const Hero = () => {
    return (
        <section className="bg-white">
            <div className="flex justify-between max-w-screen-xl px-4 py-8 m-4 md:m-6 lg:gap-8 xl:gap-0 lg:py-16">
                {/* Left side: Heading and Buttons */}
                <div className="md:w-full place-self-center">
                    <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl">
                        <span className='text-root-800'>Discover </span>the Best Restaurants in the Maldives
                    </h1>
                    <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                        Rahameeru helps you explore top-rated dining spots, read authentic reviews, and share your experiences. Join us in discovering the best places to eat around the islands!
                    </p>
                    <div className='flex gap-2 md:gap-4'>
                        <Link href='/login'><Button
                            className="bg-root-500 text-white md:text-base text-sm font-semibold flex flex-row items-center"
                        >Get started<FaArrowRight /></Button></Link>
                        <Link href={"/contact-us"}>
                            <Button className='bg-white border-black border text-black text-sm md:text-base font-semibold flex flex-row items-center' href="/contact-us">Contact us</Button>
                        </Link>
                    </div>


                </div>

                {/* Right side: Image */}
                <div className="hidden ml-auto lg:mt-0 rounded-xl lg:flex">


                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="grid gap-4">
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg" alt="" />
                            </div>
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg" alt="" />
                            </div>
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg" alt="" />
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg" alt="" />
                            </div>
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg" alt="" />
                            </div>
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg" alt="" />
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg" alt="" />
                            </div>
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg" alt="" />
                            </div>
                            <div>
                                <Image className="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg" alt="" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

"use client"

import Image from 'next/image';
import React from 'react';
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';
import './carouselstyles.css';
import Banner1 from '/public/banner/mgg-vitchakorn-vBOxsZrfiCw-unsplash.jpg'
import Banner2 from '/public/rahameeruBanner.jpg'
import Banner3 from '/public/banner/alex-haney-CAhjZmVk5H4-unsplash.jpg'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

const Carousel: React.FC = () => {
  return (
    <ResponsiveCarousel showArrows={false} showStatus={false} autoPlay={true} infiniteLoop={true} className='rounded-xl'>
      <Image src={Banner2} alt='image' className='md:h-[450px] h-[350px] object-cover' />
      <Image src={Banner2} alt='image' className='md:h-[450px] h-[350px] object-cover' />
    </ResponsiveCarousel>
  );
};

export default Carousel
"use client"

import Image from 'next/image';
import React from 'react';
import { Carousel as ResponsiveCarousel } from 'react-responsive-carousel';
// import './carouselstyles.css';
import Banner1 from '/public/banner/mgg-vitchakorn-vBOxsZrfiCw-unsplash.jpg'
import Banner2 from '/public/banner/scott-webb-Pf6Mw9RTDUI-unsplash.jpg'
import Banner3 from '/public/banner/alex-haney-CAhjZmVk5H4-unsplash.jpg'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

const Carousel: React.FC = () => {
  return (
    <ResponsiveCarousel showArrows={false} autoPlay={true} infiniteLoop={true}>
      <Image src={Banner1} alt='image' className='md:h-80 object-cover' />
      <Image src={Banner2} alt='image' className='md:h-80 object-cover' />
      <Image src={Banner3} alt='image' className='md:h-80 object-cover' />
    </ResponsiveCarousel>
  );
};

export default Carousel
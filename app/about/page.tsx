import { Button } from '@nextui-org/react';
import Image from 'next/image';
import React from 'react';

const About = () => {
  return (
    <div className="bg-white py-16 px-8 lg:px-24">
      <div className="container mx-auto">
        {/* Title */}
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-10">
          About Rahameeru
        </h1>

        {/* Introductory Paragraph */}
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
          At Rahameeru, we are passionate about connecting food lovers with the best dining experiences in the Maldives. 
          Whether you're looking for a cozy cafe, a luxury restaurant, or hidden gems, we've got you covered!
        </p>

        {/* Image */}
        <div className="flex justify-center mb-12">
          <Image
            src="/banner/alex-haney-CAhjZmVk5H4-unsplash.jpg" // Corrected path
            alt="About Us"
            width={800}
            height={500}
            className="rounded-lg shadow-xl object-cover"
          />
        </div>

        {/* Mission Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Our mission is to provide a platform where users can discover, rate, and share their dining experiences. 
            We aim to support local restaurants and help you find the perfect spot for any occasion!
          </p>
        </div>

        {/* Join Us Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Join Us
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Join our community today by creating an account and start exploring the wonderful culinary landscape of the Maldives. 
            Share your favorite places and connect with fellow food enthusiasts!
          </p>
        </div>

        {/* Call to Action Button */}
        <div className="flex justify-center">
          <Button className="bg-root-500 text-lg px-8 py-4 text-white shadow-lg hover:bg-root-600 transition-all" size="lg" href="/login">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;

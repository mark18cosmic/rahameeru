"use client"

import React, { useEffect } from 'react'
import Banner1 from "@/public/banner/scott-webb-Pf6Mw9RTDUI-unsplash.jpg"
import Image from 'next/image'
import { Card, CardBody } from '@nextui-org/react'

const AboutPage = () => {

  return (
    <div className='min-h-screen m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black'>
      {/* Who are we */}
      <div className='flex flex-col mt-5 gap-4 md:flex-row justify-between items-center'>
        <div className='w-1/2 object-fit rounded-xl'>
          <Image width={1000} src={Banner1} alt='An image' />
        </div>
        <div className='flex flex-col gap-2 w-1/2'>
          <h1 className='text-xl font-semibold text-center text-gray-600 sm:text-2xl md:text-3xl my-3'>Who are we?</h1>
          <p className='text-base text-gray-700 sm:text-lg md:text-xl leading-relaxed text-center mb-6'>At Rahameeru, we believe food is more than just a meal—it’s an adventure. Our platform connects you to the vibrant food culture of the Maldives, helping you explore, review, and enjoy the best culinary experiences the islands have to offer. Whether you’re a local or a traveler, Rahameeru is here to guide your taste buds to something amazing.</p>
        </div>
      </div>
      {/* Cards */}
      <div className='flex flex-col gap-4 mt-5 md:flex-row justify-between'>
        {/* 1 */}
        <div className='w-1/2'>
          <Card>
            <CardBody>
              <h2 className='text-xl font-semibold text-center text-gray-600 sm:text-2xl md:text-3xl my-3'>Explore, Taste, and Share with Rahameeru</h2>
              <p className='text-base text-gray-700 sm:text-lg md:text-xl leading-relaxed text-center mb-6'>At Rahameeru, we believe food is more than just a meal—it’s an adventure. Our platform connects you to the vibrant food culture of the Maldives, helping you explore, review, and enjoy the best culinary experiences the islands have to offer. Whether you’re a local or a traveler, Rahameeru is here to guide your taste buds to something amazing.</p>
            </CardBody>
          </Card>
        </div>
        {/* Mission */}
        <div className='w-1/2'>
          <Card>
            <CardBody>
              <h2 className='text-xl font-semibold text-center text-gray-600 sm:text-2xl md:text-3xl my-3'>Our Mission</h2>
              <p className='text-base text-gray-700 sm:text-lg md:text-xl leading-relaxed text-center mb-6'>To create a community where food lovers can discover the most authentic and delicious dining spots across the Maldives, powered by real reviews and honest ratings. We aim to transform the way you choose where to eat, making every meal an experience worth sharing.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AboutPage

// 1. Introduction

//     App Overview: Briefly describe what your food rating app does. For example: "Raha is a restaurant review platform that allows users to discover, rate, and share their dining experiences across the Maldives."
//     Mission Statement: Explain the purpose of your app. For example: "Our mission is to help food enthusiasts find the best dining experiences by providing a platform for honest, user-generated reviews."

// 2. Features

//     Key Features: Highlight the main features of your app, such as:
//         User ratings and reviews.
//         Detailed restaurant profiles with images, locations, and badges.
//         Search and filtering options.
//         Easy navigation and user-friendly design.
//         Map integration for finding restaurant locations.

// 3. The Story Behind the App

//     Inspiration: Share the story of how and why the app was created. For example: "Raha was born out of a love for food and a desire to create a community where people can share their culinary experiences."
//     Founders and Team: Introduce the people behind the app. Provide brief bios, highlighting their roles and contributions.

// 4. How It Works

//     User Experience: Walk users through how to use the app. For example: "Simply search for a restaurant, read reviews, and share your own experiences."
//     Rating and Review System: Explain how users can rate and review restaurants, including any guidelines or policies on review submissions.

// 5. Community and Values

//     Community Guidelines: Outline the expectations for user behavior on the platform, such as respect, honesty, and integrity in reviews.
//     Values: Highlight the core values of your app, such as transparency, community-driven content, and commitment to quality.

// 6. Testimonials (Optional)

//     User Feedback: Include quotes or testimonials from users who have benefited from the app. This adds social proof and credibility.

// 7. Call to Action

//     Join the Community: Encourage visitors to sign up, leave reviews, and participate in the community.
//     Follow Us: Provide links to your social media accounts to build a broader community.

// 8. Contact Information

//     Get in Touch: Provide an email address or a contact form for users to reach out with questions, feedback, or partnership inquiries.
//     Social Media Links: Include links to your app's social media profiles.

// 9. FAQs (Optional)

//     Frequently Asked Questions: Answer common questions about how the app works, privacy concerns, and more.
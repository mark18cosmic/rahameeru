'use client'

import { Button, Textarea } from '@nextui-org/react'
import React, { useState } from 'react'
import { FaArrowRight } from "react-icons/fa6";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from "@nextui-org/react";
import { FaStar } from "react-icons/fa6";
import { RestaurantProps } from '../restaurantCard/restaurantCard';

export const Rating = () => {
  const [rating, setRating] = useState(0);
  return (
    <>
      <div className="flex flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} className={`w-6 h-6 cursor-pointer ${rating >= star ? 'text-root-500' : 'text-root-100'}`}
            onClick={() => setRating(star)} />
        ))}
      </div>
    </>
  );
}

export const RatingIcon: React.FC<RestaurantProps> = ({ ratings }) => {
  return (
    <p className='flex items-center gap-1 text-root-500 text-lg'>{ratings} <FaStar /></p>

  )
}

function ReviewButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reviewText, setReviewText] = useState('');
  return (
    <div className="md:w-full">
      <Button
        className="bg-root-500 text-white md:text-large font-semibold flex flex-row items-center"
        onPress={onOpen}
      >
        Review <FaArrowRight />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Write a Review
              </ModalHeader>
              <ModalBody>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rating:
                  </label>
                  <Rating />
                </div>
                <div>
                  <label
                    htmlFor="review-text"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Review:
                  </label>
                  <Textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your detailed review here"
                    variant='bordered'
                    className='max-w-lg'
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button className="bg-root-500 text-white" onPress={onClose}>
                  Save Review
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default ReviewButton

import { Button, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import React, { useState } from 'react';
import { FaArrowRight, FaStar } from "react-icons/fa6";
import { ReviewProps, addReview } from '@/app/api/review/review';
import { Rating } from '../Rating/Rating';



function ReviewButton({ restaurantId, userId }: ReviewProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  const handleSaveReview = async () => {
    const review = {
      rating,
      name: "John Doe",  // Replace with actual user name if available
      content: reviewText,
      userId: userId,
      restaurantId: restaurantId,
      createdAt: new Date(),
    };

    try {
      await addReview(review);
      onOpenChange();  // Close the modal after saving
    } catch (error) {
      console.error("Error adding review: ", error);
    }
  };

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
                  <Rating
                    rating={rating}
                    setRating={setRating}
                  />
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
                <Button className="bg-root-500 text-white" onPress={handleSaveReview}>
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

export default ReviewButton;

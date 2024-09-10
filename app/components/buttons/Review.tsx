import { Button, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import React, { useState } from 'react';
import { FaArrowRight, FaStar } from "react-icons/fa6";
import { ReviewProps, addReview } from '@/app/api/review/review';
import { Rating } from '../Rating/Rating';
import { RestaurantProps } from '../restaurantCard/restaurantCard';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export const RatingIcon: React.FC<RestaurantProps> = ({ ratings }) => {
  return (
    <p className='flex items-center text-root-500 text-lg md:text-xl'>{ratings} <FaStar /></p>

  )
}

const ReviewButton: React.FC<ReviewProps> = ({ restaurantId }) => {
  const { isOpen, onOpen, onOpenChange,onClose } = useDisclosure();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const review = {
        rating,
        name: user.displayName || 'Anonymous',
        content: reviewText,
        userId: user.uid,
        restaurantId,
      
      };

      const reviewsCollection = collection(db, 'reviews');
      await addDoc(reviewsCollection, review);
      // Optionally reset form fields
      setReviewText('');
      setRating(0);
      // Close modal
      onClose();
    } catch (err) {
      console.error('Error saving review:', err);
      setError('Failed to save review. Please try again.');
    } finally {
      setLoading(false);
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

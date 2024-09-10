import React, { useEffect, useState } from 'react';
import { ReviewProps, getReviewsByRestaurant } from '@/app/api/review/review';
import ReviewCard from './ReviewCard';


interface ReviewsListProps {
  restaurantId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ restaurantId }) => {
  const [reviews, setReviews] = useState<ReviewProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const fetchedReviews = await getReviewsByRestaurant(restaurantId);
        setReviews(fetchedReviews);
      } catch (err) {
        setError('Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className='flex flex-col gap-3'>
      <h2 className='font-semibold text-large md:text-2xl'>Recent Reviews</h2>
      <div className='grid md:grid-cols-2 gap-4'>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map(review => (
            <ReviewCard
              key={review.id}
              rating={review.rating}
              name={review.name}
              content={review.content}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
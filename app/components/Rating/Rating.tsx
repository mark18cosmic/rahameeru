import { useState } from 'react';
import { FaStar } from "react-icons/fa6";

interface RatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

export const Rating: React.FC<RatingProps> = ({ rating, setRating }) => {
  return (
    <div className="flex flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`w-6 h-6 cursor-pointer ${rating >= star ? 'text-root-500' : 'text-root-100'}`}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
};

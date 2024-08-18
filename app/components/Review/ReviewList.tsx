import React from 'react'
import ReviewCard from './ReviewCard'

const ReviewList = () => {
  return (
    <div className='flex flex-col gap-3'>
      <h2 className='font-semibold text-2xl md:text-4xl'>Recent Reviews</h2>
      <div className='grid md:grid-cols-2 gap-4'>
        <ReviewCard ratings='4' />
        <ReviewCard ratings='5' />
      </div>
    </div>
  )
}
export default ReviewList
import React from 'react'
import ReviewCard from './ReviewCard'

const ReviewList = () => {
  return (
    <div className='grid md:grid-cols-2 gap-4'>
        <ReviewCard ratings='4' />
        <ReviewCard ratings='5'  />
    </div>
  )
}

export default ReviewList
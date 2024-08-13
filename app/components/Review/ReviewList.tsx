import React from 'react'
import ReviewCard from './ReviewCard'

const ReviewList = () => {
  return (
    <div className='grid md:grid-cols-2 gap-4'>
        <ReviewCard key={''} label={''} ratings={'5'} image={''} location={''} desc={''} badges={[]} />
        <ReviewCard key={''} label={''} ratings={'4'} image={''} location={''} desc={''} badges={[]} />
    </div>
  )
}

export default ReviewList
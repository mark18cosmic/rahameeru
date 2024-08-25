import React from 'react'
import { Card, CardBody } from '@nextui-org/react'
import { RatingIcon } from '../buttons/Review'

interface ReviewProps {
    rating: number;
    name: string;
    content: string;
}

const ReviewCard: React.FC<ReviewProps> = ({rating, name, content}) => {
    return (
        <Card>
            <CardBody className='flex flex-col gap-2'>
                <div className='flex flex-row justify-between items-center'>
                    <div>
                        <p className='font-medium'>{name}</p>
                    </div>
                    <div>
                        <RatingIcon key={''} label={''} ratings={rating} image={''} location={''} desc={''} badges={[]} />
                    </div>
                </div>
                <div>
                    <p className='text-md font-light md:text-lg'>{content}</p>
                </div>
            </CardBody>
        </Card>
    )
}

export default ReviewCard

// Username   // RatingIcon
// Review body text

import React from 'react'
import { Card, CardBody } from '@nextui-org/react'
import { RatingIcon } from '../buttons/Review'

interface ReviewProps {
    ratings: string;
}

const ReviewCard: React.FC<ReviewProps> = ({ratings}) => {
    return (
        <Card>
            <CardBody className='flex flex-col gap-2'>
                <div className='flex flex-row justify-between items-center'>
                    <div>
                        <p className='font-medium'>@Maakumbe</p>
                    </div>
                    <div>
                        <RatingIcon key={''} label={''} ratings={ratings} image={''} location={''} desc={''} badges={[]} />
                    </div>
                </div>
                <div>
                    <p className='text-md font-light md:text-lg'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident sapiente dolore obcaecati voluptates optio laborum aliquid voluptatem molestias quo perspiciatis reprehenderit quae similique dicta non inventore ut, a alias? Aliquam!</p>
                </div>
            </CardBody>
        </Card>
    )
}

export default ReviewCard

// Username   // RatingIcon
// Review body text

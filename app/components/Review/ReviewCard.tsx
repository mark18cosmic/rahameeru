import React from 'react'
import { Card, CardBody } from '@nextui-org/react'
import { RatingIcon } from '../buttons/Review'
import { RestaurantProps } from '../restaurantCard/restaurantCard'

const ReviewCard: React.FC<RestaurantProps> = ({ratings}) => {
    return (
        <Card>
            <CardBody>
                <div className='flex flex-row justify-between items-center'>
                    <div>
                        <p>@Maakumbe</p>
                    </div>
                    <div>
                        <RatingIcon key={''} label={''} ratings={ratings} image={''} location={''} desc={''} badges={[]} />
                    </div>
                </div>
                <div>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident sapiente dolore obcaecati voluptates optio laborum aliquid voluptatem molestias quo perspiciatis reprehenderit quae similique dicta non inventore ut, a alias? Aliquam!</p>
                </div>
            </CardBody>
        </Card>
    )
}

export default ReviewCard

// Username   // RatingIcon
// Review body text

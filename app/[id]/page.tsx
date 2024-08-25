// Define the type for a restaurant
'use client'

import Image from 'next/image';
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';
// Define the type for params
interface RestaurantParams {
    id: string;
}

import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import { notFound, useRouter } from 'next/navigation';
import Badge from '../components/badges/Badge';
import MapButton from '../components/buttons/MapButton';
import Review, { RatingIcon } from '../components/buttons/Review';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import ReviewList from '../components/Review/ReviewList';
import { Metadata } from 'next';
import { useState, useEffect } from 'react';


// Fetch data for the specific restaurant
export default function RestaurantDetail({ params }: { params: RestaurantParams }) {
    const [restaurant, setRestaurant] = useState<RestaurantProps | null>(null);
    const [error, setError] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const fetchRestaurant = async () => {
            const { id } = params;
            const formattedLabel = decodeURIComponent(id.replace(/-/g, ' '));

            try {
                const restaurants: RestaurantProps[] = await getRestaurantsData();
                const foundRestaurant = restaurants.find(
                    (r) => r.label.toLowerCase() === formattedLabel.toLowerCase()
                );

                if (!foundRestaurant) {
                    setError(true);
                    router.push('/404'); // Redirect to 404 page
                } else {
                    setRestaurant(foundRestaurant);
                }
            } catch (error) {
                setError(true);
                router.push('/404'); // Handle fetch error
            }
        };

        fetchRestaurant();
    }, [params, router]);

    if (error) return <div>Restaurant not found</div>;
    if (!restaurant) return

    <div role="status" className='flex justify-center items-center'>
        <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-root-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span className="sr-only">Loading...</span>
    </div>

        ;
    return (
        <>
            <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black">
                <div className='flex items-center justify-center'>
                    <Image src={restaurant.image} alt={restaurant.label} width={500} height={500} className='rounded-lg object-cover' />
                </div>
                <div className='flex flex-row items-center justify-between'>
                    <div>
                        {restaurant.badges.map((badge) => (
                            <Badge key={badge} label={badge} />
                        ))}{" "}
                    </div>
                    <div>
                        <RatingIcon key={''} label={''} ratings={restaurant.ratings} image={''} location={''} desc={''} badges={[]} />
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                    <div>
                        <h3 className='text-xl md:text-2xl font-semibold'>{restaurant.label}</h3>
                    </div>
                    <div>
                        <p className='font-light'>{restaurant.desc}</p>
                    </div>
                </div>
                <div className='flex flex-row items-center justify-between'>
                    <div>
                        <p className='flex items-center gap-1 flex-row'><HiOutlineLocationMarker /> {restaurant.location}</p>
                    </div>
                    <div className='flex flex-row gap-2 md:gap-4'>
                        <MapButton />
                        <Review />
                    </div>
                </div>
                <div>
                    <ReviewList />
                </div>
            </main></>
    );
}


// Generate paths for all restaurants
// export async function generateStaticParams() {
//     const restaurants: RestaurantProps[] = await getRestaurantsData(); // Type the restaurants array
//     return restaurants.map((restaurant) => ({
//         id: restaurant.label.replace(/\s+/g, '-').toLowerCase(),
//     }));
// }

// location // buttons
// latest reviews

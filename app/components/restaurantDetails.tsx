'use client'

import Image from 'next/image';
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';
import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import { useRouter } from 'next/navigation';
import Badge from '../components/badges/Badge';
import MapButton from '../components/buttons/MapButton';
import Review, { RatingIcon } from '../components/buttons/Review';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import ReviewList from '../components/Review/ReviewList';
import { useState, useEffect } from 'react';
import { Spinner } from '@nextui-org/react';
// import Navbar from '../components/Navbar';

// Define the type for params
interface RestaurantParams {
    id: string;
}

export default function RestaurantDetail({ params }: { params: RestaurantParams }) {
    const [restaurant, setRestaurant] = useState<RestaurantProps | null>(null);
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Loading state
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
            } finally {
                setLoading(false); // End loading when the data fetching is complete
            }
        };

        fetchRestaurant();
    }, [params, router]);

    // If an error occurred, display the error message
    if (error) return <div>Restaurant not found</div>;

    // Display a loading spinner while fetching data
    if (loading) {
        return (
            <div role="status" className='flex justify-center items-center h-screen'>
                <Spinner className='text-root-500' />
            </div>
        );
    }

    // Display the restaurant content after loading
    return (
        <>
            {/* <Navbar /> */}
            <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black">
                {/* Image */}
                <div className='flex-col md:flex-row'>
                    <div>
                        <div className='flex items-center justify-center'>
                            <Image src={restaurant!.image} alt={restaurant!.label} width={500} height={500} className='rounded-lg object-cover' />
                        </div>
                        <div className='flex flex-row items-center justify-between'>
                            <div>
                                {restaurant!.badges.map((badge) => (
                                    <Badge key={badge} label={badge} />
                                ))}{" "}
                            </div>
                            <div>
                                <RatingIcon
                                    key={restaurant!.key}
                                    label={restaurant!.label}
                                    ratings={restaurant!.ratings}
                                    image={restaurant!.image}
                                    location={restaurant!.location}
                                    desc={restaurant!.desc}
                                    badges={restaurant!.badges}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Info */}
                    <div className='flex flex-col gap-2'>
                        <div>
                            <h3 className='text-xl md:text-2xl font-semibold'>{restaurant!.label}</h3>
                        </div>
                        <div>
                            <p className='font-light'>{restaurant!.desc}</p>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row items-center justify-between'>
                    <div>
                        <p className='flex items-center gap-1 flex-row'>
                            <HiOutlineLocationMarker /> {restaurant!.location}
                        </p>
                    </div>
                    <div className='flex flex-row gap-2 md:gap-4'>
                        <MapButton />
                        <Review rating={0} name={''} content={''} userId={''} restaurantId={restaurant!.key} id={''} />
                    </div>
                </div>
                <div>
                    <ReviewList restaurantId={restaurant!.key} />
                </div>
            </main>
        </>
    );
}

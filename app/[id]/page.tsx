import { Metadata } from 'next';
import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import RestaurantDetail from '@/app/components/restaurantDetails';

// Export metadata as an asynchronous function
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const restaurants = await getRestaurantsData(); // Fetch all restaurants
    const restaurant = restaurants.find((rest) => rest.label.replace(/\s+/g, '-').toLowerCase() === params.id); // Find the specific restaurant

    if (restaurant) {
        return {
            title: `${restaurant.label} - Rahameeru`,
            description: `Discover ${restaurant.label} and review your favorite places on Rahameeru.`,
        };
    }

    // Fallback metadata
    return {
        title: 'Rahameeru',
        description: 'Find the best restaurants and review your favorites by creating an account on Rahameeru.',
    };
}

// Page Component
export default function RestaurantPage({ params }: { params: { id: string } }) {
    return <RestaurantDetail params={params} />;
}

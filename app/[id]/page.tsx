// Import necessary modules and components
import { Metadata } from 'next';
import { getRestaurantsData } from '@/app/utils/getRestaurantData';
import RestaurantDetail from '@/app/components/restaurantDetails';
import { RestaurantProps } from '../components/restaurantCard/restaurantCard';

// Export metadata as an asynchronous function
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const restaurants: RestaurantProps[] = await getRestaurantsData(); // Fetch all restaurants
    const restaurant = restaurants.find((rest) => rest.label.replace(/\s+/g, '-').toLowerCase() === params.id); // Find the specific restaurant

    // Return metadata based on the found restaurant
    if (restaurant) {
        return {
            title: `${restaurant.label} | Rahameeru`,
            description: `Discover ${restaurant.label} and review your favorite places on Rahameeru.`,
        };
    }

    // Fallback metadata if restaurant not found
    return {
        title: 'Rahameeru',
        description: 'Find the best restaurants and review your favorites by creating an account on Rahameeru.',
    };
}

// Generate static paths for SSG (if applicable)
export async function generateStaticParams() {
    const restaurants: RestaurantProps[] = await getRestaurantsData();

    // Create paths for each restaurant based on its label
    return restaurants.map((restaurant) => ({
        id: restaurant.label.replace(/\s+/g, '-').toLowerCase(),
    }));
}

// Page Component
export default function RestaurantPage({ params }: { params: { id: string } }) {
    return <RestaurantDetail params={params} />;
}

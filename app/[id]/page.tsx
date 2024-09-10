import { generateStaticParams } from '@/app/utils/getRestaurantData';
import RestaurantDetail from '@/app/components/restaurantDetails';
import { Metadata } from 'next';

// Export metadata
export const metadata: Metadata = {
  title: 'Rahameeru',
  description: 'Find the best restaurants and review your favorite ones by simply creating an account on Rahameeru.',
};

// Generate static paths
export { generateStaticParams };

// Page Component
export default function RestaurantPage({ params }: { params: { id: string } }) {
  return <RestaurantDetail params={params} />;
}

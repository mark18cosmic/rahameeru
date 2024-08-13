import Carousel from "./components/carousel/Carousel";
import PopularRestaurants from "./components/Home/PopularRestaurants";


export default function Home() {
  return (
    <div>
      <Carousel />
      <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black">
        <PopularRestaurants label={"Featured Restaurants"} />
        <PopularRestaurants label={"Popular Today"} />
        <PopularRestaurants label={"Date Spots"} />

      </main>
    </div>
  );
}

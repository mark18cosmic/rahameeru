import Carousel from "./components/carousel/Carousel";
import PopularRestaurants from "./components/Home/PopularRestaurants";
import { NextSeo } from "next-seo";


export default function Home() {
  return (
    <>
    <NextSeo 
      title="Rahameeru | Find the best places to dine near you"
      description="Find the best restaurants and review your favorite ones by simply creating an account on rahameeru. With an extensive library full of restaurants in Male and Hulhumale find the cheapest or most luxurious or even the best date spots now!"
    />
      <div>
        <Carousel />
        <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black">
          <PopularRestaurants label={"Featured Restaurants"} />
          <PopularRestaurants label={"Popular Today"} />
          <PopularRestaurants label={"Date Spots"} />

        </main>
      </div></>
  );
}

import Image from "next/image";
import Navbar from "./components/Navbar";
import Carousel from "./components/carousel/Carousel";
import PopularRestaurants from "./components/Home/PopularRestaurants";
import { Search } from "./components/Home/Search";


export default function Home() {
  return (
    <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8">
      <Carousel />
      <PopularRestaurants label={"Featured Restaurants"} />
      <PopularRestaurants label={"Popular Today"} />
      <PopularRestaurants label={"Date Spots"} />

    </main>
  );
}

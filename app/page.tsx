import Carousel from "./components/carousel/Carousel";
import Hero from "./components/Home/hero";
import PopularRestaurants from "./components/Home/PopularRestaurants";
import Navbar from "./components/Navbar";


export default function Home() {
  return (
    <>
      {/* <Navbar /> */}
      <div>
        {/* <Carousel /> */}
        <Hero />
        <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black">
          <PopularRestaurants label={"Featured Restaurants"} />
          <PopularRestaurants label={"Fast Food"} />
          <PopularRestaurants label={"Recently Added"} />
        </main>
      </div>
    </>
  );
}

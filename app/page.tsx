import Carousel from "./components/carousel/Carousel";
import PopularRestaurants from "./components/Home/PopularRestaurants";
import Navbar from "./components/Navbar";


export default function Home() {
  return (
    <>
      <Navbar />
      <div>
        <div className="text-center text-white text-xl bg-root-500">
          <p>Page is currently in developement</p>
        </div>
        <Carousel />
        <main className="m-4 md:m-6 flex flex-col gap-5 md:gap-8 text-black">
          <PopularRestaurants label={"Featured Restaurants"} />
        </main>
      </div></>
  );
}

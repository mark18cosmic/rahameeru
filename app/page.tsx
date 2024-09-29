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
        </main>
      </div>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3567729252312652"
        crossOrigin="anonymous"></script>
    </>
  );
}

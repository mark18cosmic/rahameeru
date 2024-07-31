import Image from "next/image";
import Navbar from "./components/Navbar";
import Search from "./components/Home/Search";
import Carousel from "./components/carousel/Carousel";

const images = [
  '/public/banner/mgg-vitchakorn-vBOxsZrfiCw-unsplash.jpg',
  '/public/banner/mgg-vitchakorn-vBOxsZrfiCw-unsplash.jpg'
]


export default function Home() {
  return (
    <main className="m-4 flex flex-col gap-8">
      <Navbar />
      <Search />
      <Carousel/>
    </main>
  );
}

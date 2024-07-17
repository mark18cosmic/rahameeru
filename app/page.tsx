import Image from "next/image";
import Navbar from "./components/Navbar";
import Search from "./components/Home/Search";


export default function Home() {
  return (
    <main className="m-4 flex flex-col gap-8">
      <Navbar />
      <Search />
    </main>
  );
}

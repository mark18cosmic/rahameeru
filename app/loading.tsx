import { ChiliLoader } from "./components/ui/ChiliLoader";

/** Shown while a route segment streams in. */
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <ChiliLoader />
    </div>
  );
}

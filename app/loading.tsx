import { GridSkeleton } from "./components/ui/Skeletons";

/** Shown while a route segment streams in: the shape of a page, not a spinner. */
export default function Loading() {
  return <GridSkeleton />;
}

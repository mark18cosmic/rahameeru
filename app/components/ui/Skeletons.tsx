import { cn } from "@/app/lib/utils";
import { CardSkeleton } from "../RestaurantCard";

/*
 * Loading states drawn in the shape of what is coming. A placeholder that
 * matches the page means nothing jumps when the content lands, and the wait
 * reads as "nearly there" rather than "something is happening somewhere".
 */

/** `cn`, not `cx`: a caller's radius (rounded-full) has to beat the default. */
export function Bar({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

function Status({ label }: { label: string }) {
  return (
    <span role="status" className="sr-only">
      {label}
    </span>
  );
}

/** A heading and a grid of cards: explore, favourites, any list page. */
export function GridSkeleton({ label = "Loading", cards = 8 }: { label?: string; cards?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 md:px-6 md:pt-10">
      <Status label={label} />
      <Bar className="h-4 w-28" />
      <Bar className="mt-3 h-9 w-2/3 max-w-md md:h-12" />
      <Bar className="mt-3 h-4 w-1/2 max-w-sm" />
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** The restaurant page: gallery, badges, name, tabs, then text. */
export function RestaurantSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 md:px-6 md:pt-8">
      <Status label="Loading restaurant" />
      <Bar className="h-4 w-32" />
      <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr]">
        <Bar className="aspect-[4/3] w-full rounded-3xl md:aspect-auto md:h-[420px]" />
        <div className="hidden grid-cols-2 gap-3 md:grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} className="h-full rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <Bar className="h-7 w-28 rounded-full" />
        <Bar className="h-7 w-12 rounded-full" />
        <Bar className="h-7 w-20 rounded-full" />
      </div>
      <Bar className="mt-4 h-10 w-2/3 max-w-sm" />
      <Bar className="mt-3 h-5 w-56" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex gap-6 border-b border-[var(--line)] pb-3">
            <Bar className="h-5 w-16" />
            <Bar className="h-5 w-14" />
            <Bar className="h-5 w-20" />
          </div>
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-3 h-4 w-11/12" />
          <Bar className="mt-3 h-4 w-3/4" />
        </div>
        <Bar className="h-64 rounded-3xl" />
      </div>
    </div>
  );
}

/** The shared wheel page: a wheel on one side, the places on the other. */
export function WheelSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:px-6 md:pt-10">
      <Status label="Loading the wheel" />
      <Bar className="h-10 w-64 md:h-14" />
      <Bar className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="flex flex-col items-center gap-4">
          <Bar className="h-[300px] w-[300px] rounded-full" />
          <Bar className="h-12 w-full max-w-xs rounded-full" />
        </div>
        <RowsSkeleton rows={6} />
      </div>
    </div>
  );
}

/** Rows with a thumbnail: lists of places, search results. */
export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[var(--line)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Bar className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1">
            <Bar className="h-4 w-1/2" />
            <Bar className="mt-2 h-3 w-1/3" />
          </div>
          <Bar className="h-10 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Dashboards and the admin console: a heading and a stack of panels. */
export function PanelSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-6">
      <Status label={label} />
      <Bar className="h-9 w-56" />
      <Bar className="mt-3 h-4 w-72 max-w-full" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bar key={i} className="h-28 rounded-3xl" />
        ))}
      </div>
      <Bar className="mt-4 h-64 rounded-3xl" />
    </div>
  );
}

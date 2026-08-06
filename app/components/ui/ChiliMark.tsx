"use client";

/**
 * The chili used for every loading state in the app.
 *
 * Drawn as outlines in the brand colour rather than a filled shape: at 20px in
 * a pull-to-refresh pill a solid blob loses its silhouette, while strokes keep
 * the curve of the pod and the kink in the stalk readable at any size. It
 * inherits `currentColor`, so a caller can tint it without a second copy.
 */
export function ChiliMark({
  size = 64,
  className = "",
  /** 0–1. Below 1 the pod is drawn but not yet filled — used while pulling. */
  fill = 0,
}: {
  size?: number;
  className?: string;
  fill?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 64"
      width={size}
      height={(size / 48) * 64}
      className={className}
      fill="none"
      aria-hidden
    >
      {/* Pod, tapering from the shoulder to a hooked tip */}
      <path
        d="M24 17c9.5 1.5 15.5 9.5 15.5 20.5 0 13.5-9 22.5-19 22.5-5.5 0-9.5-3-9.5-7.5 0-4 3-6 7-6.5 8-1 12.5-7 12.5-14.5 0-6.5-2.5-11-6.5-14z"
        fill="currentColor"
        fillOpacity={fill}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Highlight down the shoulder */}
      <path
        d="M28.5 25.5c2.6 2.6 4 6.2 4 10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Stalk */}
      <path
        d="M24 17c-.5-6 2.5-10.5 8-12"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* Calyx */}
      <path
        d="M17.5 15.5c2-3 8.5-3.5 11.5-.5-2.5 3-9 3.5-11.5.5z"
        fill="currentColor"
        fillOpacity={0.18 + fill * 0.5}
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

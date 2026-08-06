"use client";

/**
 * The chili used for every loading state.
 *
 * Three things make it read as a chili rather than a flame or a teardrop: the
 * pod is asymmetric (broad at the shoulder, sweeping right and tapering left),
 * the tip is a mitred point rather than a rounded cap, and the calyx sits
 * across the top with visible points. The earlier version was a symmetrical
 * blob and looked like neither.
 *
 * Strokes in `currentColor` rather than a fill, so it holds its silhouette at
 * 20px in a pull-to-refresh pill and takes the brand colour from its parent.
 */
export function ChiliMark({
  size = 64,
  className = "",
  /** 0–1. The pod fills as this rises — used while pulling to refresh. */
  fill = 0,
}: {
  size?: number;
  className?: string;
  fill?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Pod. Mitred join at the tip so it ends in a point. */}
      <path
        d="M24 19 C39 21 46 33 44 44 C42.4 54 34 59.5 27.5 57.5 C31 49 31 31 24 19 Z"
        fill="currentColor"
        fillOpacity={0.18 + fill * 0.72}
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="miter"
        strokeMiterlimit={4}
      />
      {/* Calyx across the shoulder */}
      <path
        d="M17 19 L21.5 13.5 L27 15.5 L32.5 13.5 L34.5 19 C30 23.5 21.5 23.5 17 19 Z"
        fill="currentColor"
        fillOpacity={0.4}
        stroke="currentColor"
        strokeWidth="2.8"
      />
      {/* Stem */}
      <path
        d="M26 14.5 C26 9.5 29.5 6.5 34.5 6.5"
        stroke="currentColor"
        strokeWidth="3.4"
      />
      {/* Crease down the shoulder, where the light catches */}
      <path
        d="M31 28 C35 31.5 37 37 36 43"
        stroke="currentColor"
        strokeWidth="2.4"
        opacity="0.5"
      />
    </svg>
  );
}

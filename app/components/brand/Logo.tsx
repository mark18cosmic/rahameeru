import { cx } from "@/app/lib/utils";

/*
 * Decide.mv's mark: a capital D whose bowl is half of the decision wheel,
 * spokes running from the hub on the stem. It is the letter and the app's
 * signature feature at once, and at favicon size it still reads as a plain,
 * solid D.
 *
 * The geometry lives in one place (MARK_PATHS) so the inline logo, the
 * favicon and the generated app icons are drawn from the same shapes.
 */

/** In a 48 by 48 box. The D, then the spokes cut out of it. */
export const MARK_PATHS = {
  d: "M9 6h13a18 18 0 0 1 0 36H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
  spokes: "M16 24L33.8 13.7M16 24h20.5M16 24l17.8 10.3",
  hub: { cx: 16, cy: 24, r: 3.6 },
};

export function LogoMark({
  size = 28,
  className,
  title,
}: {
  size?: number;
  className?: string;
  /** Pass for a standalone mark; omit when a wordmark sits beside it. */
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cx("shrink-0", className)}
    >
      {title && <title>{title}</title>}
      <path d={MARK_PATHS.d} fill="#F84B3B" />
      <path
        d={MARK_PATHS.spokes}
        stroke="var(--logo-cut, #fff)"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      <circle {...MARK_PATHS.hub} fill="var(--logo-cut, #fff)" />
    </svg>
  );
}

/** Mark plus "Decide.mv" in the display face. */
export function Wordmark({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className={cx("inline-flex items-center gap-1.5", className)}>
      <LogoMark size={big ? 40 : 28} />
      <span
        className={cx(
          "font-display font-bold tracking-tight text-ink-900 dark:text-white",
          big ? "text-3xl" : "text-[1.35rem] leading-none"
        )}
      >
        Decide<span className="text-root-500">.mv</span>
      </span>
    </span>
  );
}

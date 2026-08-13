"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";
import { cn } from "@/app/lib/utils";

export interface MarqueeImage {
  src: string;
  alt: string;
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
}

export interface ThreeDMarqueeProps {
  images: MarqueeImage[];
  className?: string;
  cols?: number; // default is 4
  onImageClick?: (image: MarqueeImage, index: number) => void;
}

export const ThreeDMarquee: React.FC<ThreeDMarqueeProps> = ({
  images,
  className = "",
  cols = 4,
  onImageClick,
}) => {
  const reduceMotion = useReducedMotion();

  // Clone the image list twice
  const duplicatedImages = [...images, ...images];

  const groupSize = Math.ceil(duplicatedImages.length / cols);
  const imageGroups = Array.from({ length: cols }, (_, index) =>
    duplicatedImages.slice(index * groupSize, (index + 1) * groupSize)
  );

  const handleImageClick = (image: MarqueeImage, globalIndex: number) => {
    if (onImageClick) {
      onImageClick(image, globalIndex);
    } else if (image.href) {
      window.open(image.href, image.target || "_self");
    }
  };

  return (
    <section
      className={cn(
        "mx-auto block h-[600px] max-sm:h-[400px] overflow-hidden rounded-2xl bg-white dark:bg-black",
        className
      )}
    >
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          transform: "rotateX(55deg) rotateY(0deg) rotateZ(45deg)",
        }}
      >
        <div className="w-full scale-90 overflow-hidden sm:scale-100">
          {/* Column count is set inline rather than with `grid-cols-${cols}` —
              Tailwind only emits classes it can see as complete strings in the
              source, so the interpolated version compiled to nothing and every
              layout collapsed to a single column. */}
          <div
            className="relative grid h-full w-full origin-center gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {imageGroups.map((imagesInGroup, idx) => (
              <motion.div
                key={`column-${idx}`}
                animate={reduceMotion ? undefined : { y: idx % 2 === 0 ? 100 : -100 }}
                transition={{
                  duration: idx % 2 === 0 ? 10 : 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="relative flex flex-col items-center gap-6"
              >
                <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                {imagesInGroup.map((image, imgIdx) => {
                  const globalIndex = idx * groupSize + imgIdx;
                  const isClickable = image.href || onImageClick;

                  return (
                    <div key={`img-${imgIdx}`} className="relative">
                      <div className="absolute left-0 top-0 h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <motion.img
                        whileHover={{ y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        src={image.src}
                        alt={image.alt}
                        width={970}
                        height={700}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                          "aspect-[970/700] w-full max-w-[200px] rounded-lg object-cover shadow-xl ring ring-gray-300/30 transition-shadow duration-300 hover:shadow-2xl dark:ring-gray-800/50",
                          isClickable && "cursor-pointer"
                        )}
                        onClick={() => handleImageClick(image, globalIndex)}
                      />
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

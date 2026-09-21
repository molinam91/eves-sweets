"use client";

import { useEffect, useState } from "react";
import { CAROUSEL_SLIDES } from "@/lib/mockData";

const INTERVAL_MS = 3800;

export default function Carousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % CAROUSEL_SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mt-5 h-48 w-full overflow-hidden rounded-3xl shadow-lg shadow-brand-pink-deep/20 sm:h-64">
      {CAROUSEL_SLIDES.map((slide, index) => (
        <div
          key={slide.caption}
          className={`absolute inset-0 flex items-center justify-center px-6 text-center transition-opacity duration-1000 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          style={{ background: `linear-gradient(135deg, ${slide.gradient[0]}, ${slide.gradient[1]})` }}
        >
          <p className="font-script text-2xl text-white drop-shadow sm:text-3xl">
            {slide.caption}
          </p>
        </div>
      ))}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {CAROUSEL_SLIDES.map((slide, index) => (
          <span
            key={slide.caption}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              index === active ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

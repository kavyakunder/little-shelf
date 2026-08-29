"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = { sm: "text-sm", md: "text-xl", lg: "text-3xl" };

export default function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = Boolean(onChange);
  const display = hover ?? value;

  return (
    <div className={`flex gap-0.5 ${SIZE_MAP[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(null)}
          className={`leading-none transition-colors ${
            interactive ? "cursor-pointer" : "cursor-default"
          } ${star <= display ? "text-gold" : "text-stone-300"}`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

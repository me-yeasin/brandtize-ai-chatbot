"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const DevBanner = () => {
  // Simple pulsing animation
  const [isPulsing, setIsPulsing] = useState(true);

  // Toggle pulsing animation every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing((prev) => !prev);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);



  return (
    <Link href="/buy-this-project">
      <div
        className={`hidden min-[340px]:block bg-orange-500 text-white text-xs px-2 py-1 rounded uppercase tracking-wider font-bold shadow-md hover:bg-orange-600 transition-colors cursor-pointer ${
          isPulsing ? "animate-pulse" : ""
        }`}
        title="Click to buy this project"
      >
        Buy this project
      </div>
    </Link>
  );
};

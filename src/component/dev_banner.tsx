"use client";

import { useEffect, useState } from "react";

interface DevBannerProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const DevBanner = ({ position = "top-right" }: DevBannerProps) => {
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

  // Position styling based on props
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 m-3`}>
      <div
        className={`bg-orange-500 text-white text-xs px-2 py-1 rounded uppercase tracking-wider font-bold shadow-md ${
          isPulsing ? "animate-pulse" : ""
        }`}
        title="This site is in development mode"
      >
        development
      </div>
    </div>
  );
};

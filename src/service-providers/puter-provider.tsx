"use client";

import { useEffect } from "react";

interface PuterProviderProps {
  children: React.ReactNode;
}

export default function PuterProvider({ children }: PuterProviderProps) {
  useEffect(() => {
    // Load Puter.js script dynamically
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => {
      console.log("Puter.js loaded successfully");
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      document.head.removeChild(script);
    };
  }, []);

  return <>{children}</>;
}

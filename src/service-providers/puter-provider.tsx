"use client";

import { useEffect } from "react";

interface PuterProviderProps {
  children: React.ReactNode;
}

export default function PuterProvider({ children }: PuterProviderProps) {
  useEffect(() => {
    // Check if the script is already loaded or loading
    const existingScript = document.querySelector(
      'script[src="https://js.puter.com/v2/"]'
    );

    // If the script is already present, don't add it again
    if (existingScript) {
      console.log("Puter.js script already exists, not loading again");
      return;
    }

    // Load Puter.js script dynamically
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.id = "puter-script"; // Add an id for easier identification

    script.onload = () => {
      console.log("Puter.js loaded successfully");
    };

    script.onerror = (error) => {
      console.error("Error loading Puter.js:", error);
    };

    document.head.appendChild(script);

    return () => {
      // We don't want to remove the script on component unmount
      // as it might be needed by other components
      // This prevents re-registration of custom elements
    };
  }, []);

  return <>{children}</>;
}

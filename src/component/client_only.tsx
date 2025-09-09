"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * A wrapper component that renders its children only on the client-side
 * to avoid hydration mismatch errors with localStorage and other browser APIs
 */
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // On first render, don't render the children to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}

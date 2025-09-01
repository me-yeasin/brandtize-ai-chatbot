"use client";

import { useEffect, useState } from "react";
import { usePuter } from "./usePuter";

interface PuterUser {
  username: string;
  email: string;
  uuid: string;
  // Add other user properties as needed
}

export function usePuterAuth() {
  const { puter, isLoading: puterLoading, error: puterError } = usePuter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PuterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (puterLoading) return;

    const checkAuth = async () => {
      if (!puter) {
        setIsLoading(false);
        return;
      }

      try {
        const signedIn = puter.auth.isSignedIn();
        setIsAuthenticated(signedIn);

        if (signedIn) {
          const userInfo = await puter.auth.getUser();
          // Coerce unknown shape into PuterUser if possible
          if (userInfo && typeof userInfo === "object") {
            const u = userInfo as Record<string, unknown>;
            const username =
              typeof u.username === "string"
                ? u.username
                : typeof u.name === "string"
                ? u.name
                : "";
            const email = typeof u.email === "string" ? u.email : "";
            const uuid =
              typeof u.uuid === "string"
                ? u.uuid
                : typeof u.id === "string"
                ? u.id
                : "";

            if (username || email || uuid) setUser({ username, email, uuid });
            else setUser(null);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        setError("Failed to check authentication status");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [puter, puterLoading]);

  const signIn = async () => {
    if (!puter) {
      setError("Puter.js not loaded");
      return;
    }

    try {
      setIsLoading(true);
      await puter.auth.signIn();
      setIsAuthenticated(true);

      // Get user info after sign in
      const userInfo = await puter.auth.getUser();
      if (userInfo && typeof userInfo === "object") {
        const u = userInfo as Record<string, unknown>;
        const username =
          typeof u.username === "string"
            ? u.username
            : typeof u.name === "string"
            ? u.name
            : "";
        const email = typeof u.email === "string" ? u.email : "";
        const uuid =
          typeof u.uuid === "string"
            ? u.uuid
            : typeof u.id === "string"
            ? u.id
            : "";

        if (username || email || uuid) setUser({ username, email, uuid });
        else setUser(null);
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      console.error("Error signing in:", err);
      setError("Failed to sign in");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!puter) {
      setError("Puter.js not loaded");
      return;
    }

    try {
      setIsLoading(true);
      await puter.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading: isLoading || puterLoading,
    error: error || puterError,
    signIn,
    signOut,
  };
}

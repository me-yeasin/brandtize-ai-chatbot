"use client";

import { useEffect, useState } from "react";

import { AiResponse } from "@/models/ai_response";

interface PuterAI {
  chat: (
    prompt: string,
    options?: Record<string, unknown>,
    testMode?: boolean
  ) =>
    | Promise<AiResponse>
    | AsyncIterable<unknown>
    | { getReader: () => unknown }
    | { on: (...args: unknown[]) => void };
  txt2img: (prompt: string) => Promise<HTMLImageElement>;
  img2txt: (imageUrl: string) => Promise<string>;
  txt2speech: (text: string) => Promise<string>;
}

interface PuterFS {
  write: (path: string, content: string) => Promise<void>;
  read: (path: string) => Promise<string>;
  readdir: (path: string) => Promise<string[]>;
  delete: (path: string) => Promise<void>;
  mkdir: (path: string) => Promise<void>;
}

interface PuterAuth {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isSignedIn: () => boolean;
  getUser: () => Promise<Record<string, unknown> | null>;
}

interface PuterKV {
  set: (key: string, value: unknown) => Promise<void>;
  get: (key: string) => Promise<unknown>;
  del: (key: string) => Promise<void>;
}

export interface Puter {
  ai: PuterAI;
  fs: PuterFS;
  auth: PuterAuth;
  kv: PuterKV;
  print: (message: unknown) => void;
}

export function usePuter() {
  const [puter, setPuter] = useState<Puter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkPuter = () => {
      if (
        typeof window !== "undefined" &&
        (window as unknown as Record<string, unknown>).puter
      ) {
        if (!mounted) return;
        setPuter((window as unknown as Record<string, unknown>).puter as Puter);
        setIsLoading(false);
      } else {
        // If Puter.js is not loaded yet, check again in 100ms
        setTimeout(checkPuter, 100);
      }
    };

    checkPuter();

    // Timeout after 5 seconds - read latest via mounted flag
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        setError("Puter.js failed to load");
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [isLoading]);

  return { puter, isLoading, error };
}

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/lib/actions";

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Brandtize AI</h1>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>
        <form action={dispatch} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          {errorMessage && (
            <div
              className="p-3 text-sm text-red-500 bg-red-900/30 border border-red-900 rounded-md"
              role="alert"
            >
              <p>{errorMessage}</p>
            </div>
          )}
          <LoginButton />
        </form>
        <div className="text-center">
            <p className="text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <a href="/register" className="font-medium text-blue-500 hover:text-blue-400">
                    Sign up
                </a>
            </p>
        </div>
      </div>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

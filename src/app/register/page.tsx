"use client";

import { useFormState, useFormStatus } from "react-dom";
import { register } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const [errorMessage, dispatch] = useFormState(register, undefined);
  const router = useRouter();

  useEffect(() => {
    if (errorMessage === null) {
        // Success
        router.push("/login?registered=true");
    }
  }, [errorMessage, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-lg border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Brandtize AI</h1>
          <p className="mt-2 text-gray-400">Create your account</p>
        </div>
        <form action={dispatch} className="space-y-6">
            <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
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
              minLength={6}
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
          <RegisterButton />
        </form>
        <div className="text-center">
            <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-blue-500 hover:text-blue-400">
                    Sign in
                </a>
            </p>
        </div>
      </div>
    </div>
  );
}

function RegisterButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Creating account..." : "Sign up"}
    </button>
  );
}

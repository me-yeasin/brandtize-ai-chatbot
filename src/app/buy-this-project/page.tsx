"use client";

import { useEffect, useState } from "react";

interface Bid {
  id: string;
  email: string;
  phone?: string;
  price: number;
  createdAt: string;
}

export default function BuyThisProject() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing bids on component mount
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await fetch("/api/bids");
        if (response.ok) {
          const data = await response.json();
          // Sort bids by price in descending order
          const sortedBids = data.sort((a: Bid, b: Bid) => b.price - a.price);
          setBids(sortedBids);
        }
      } catch (error) {
        console.error("Failed to fetch bids:", error);
      }
    };

    fetchBids();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Valid price is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone: phone || undefined, // Only include if provided
          price: Number(price),
        }),
      });

      if (response.ok) {
        const newBid = await response.json();

        // Add the new bid to the list and sort again
        const updatedBids = [...bids, newBid].sort((a, b) => b.price - a.price);
        setBids(updatedBids);

        // Reset form
        setEmail("");
        setPhone("");
        setPrice("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit bid");
      }
    } catch (error) {
      console.error("Error submitting bid:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Buy This Project</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bid submission form */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Place Your Bid</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Bid Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Bid Now"}
            </button>
          </form>
        </div>

        {/* Current bids display */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Current Bids</h2>

          {bids.length === 0 ? (
            <p className="text-gray-500">No bids yet. Be the first to bid!</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className="border border-gray-200 rounded-md p-4 hover:bg-gray-900"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{bid.email}</span>
                    <span className="text-xl font-bold text-green-600">
                      ${bid.price.toLocaleString()}
                    </span>
                  </div>
                  {bid.phone && (
                    <div className="text-sm text-gray-500 mt-1">
                      Phone: {bid.phone}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(bid.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

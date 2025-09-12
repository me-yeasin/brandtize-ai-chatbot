import connectToDatabase from "@/lib/mongodb";
import Bid from "@/models/mongodb/bid";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    await connectToDatabase();
    const bids = await Bid.find({}).sort({ price: -1 }).lean();

    return NextResponse.json(bids, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch bids:", error);
    return NextResponse.json(
      { message: "Failed to fetch bids" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, phone, price } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json(
        { message: "Valid price is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newBid = new Bid({
      id: uuidv4(),
      email,
      phone,
      price: Number(price),
      createdAt: new Date(),
    });

    await newBid.save();

    return NextResponse.json(newBid.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Failed to create bid:", error);
    return NextResponse.json(
      { message: "Failed to create bid" },
      { status: 500 }
    );
  }
}

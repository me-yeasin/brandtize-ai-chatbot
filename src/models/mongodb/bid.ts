import { Schema, model, models } from "mongoose";

// Define Bid Schema
const bidSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create or retrieve the Bid model
const Bid = models.Bid || model("Bid", bidSchema);

export default Bid;

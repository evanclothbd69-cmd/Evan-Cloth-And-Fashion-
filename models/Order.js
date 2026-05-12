// models/Order.js (Updated with payment tracking)

import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["sslcommerz", "bkash", "nagad", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Failed", "Cancelled"],
      default: "Pending",
    },
    trackingId: {
      type: String,
      unique: true,
    },
    shippingAddress: String,
    phone: String,
    // Payment gateway transaction IDs
    transactionId: String,
    validationId: String,
    bkashTransactionId: String,
    bkashPaymentId: String,
    nagadTransactionId: String,
    nagadReference: String,
    cardBrand: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
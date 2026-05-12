// app/api/bkash/webhook/route.js - bKash Payment Webhook

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { sendPaymentConfirmation } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { transactionId, status, amount, paymentId } = body;

    logger.info("bKash webhook received", { transactionId, status });

    // Find order by transaction ID
    const order = await Order.findOne({ transactionId });

    if (!order) {
      logger.error("Order not found for transaction", { transactionId });
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check payment status
    if (status === "Completed" || status === "Success") {
      // Verify amount
      if (parseFloat(amount) !== order.total) {
        logger.error("Amount mismatch", { expected: order.total, received: amount });
        return NextResponse.json(
          { error: "Amount mismatch" },
          { status: 400 }
        );
      }

      // Update order
      order.paymentStatus = "completed";
      order.status = "Confirmed";
      order.bkashTransactionId = transactionId;
      order.bkashPaymentId = paymentId;
      await order.save();

      logger.info("bKash payment confirmed", { orderId: order._id });

      // Send confirmation email
      const user = await User.findById(order.userId);
      if (user) {
        await sendPaymentConfirmation(order, user.email, amount);
      }

      return NextResponse.json({
        message: "Payment confirmed",
        orderId: order._id,
      });
    } else if (status === "Failed" || status === "Cancelled") {
      order.paymentStatus = "failed";
      order.status = "Failed";
      await order.save();

      logger.warn("bKash payment failed", { orderId: order._id, status });

      return NextResponse.json({
        message: "Payment failed",
        orderId: order._id,
      });
    }

    return NextResponse.json({
      message: "Webhook processed",
    });
  } catch (error) {
    logger.error("bKash webhook error", { error: error.message });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
// app/api/sslcommerz/webhook/route.js - SSL Commerz Payment Webhook

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
    const {
      tran_id,
      status,
      amount,
      currency,
      val_id,
      card_issuer,
      card_brand,
    } = body;

    logger.info("SSLCommerz webhook received", { tran_id, status });

    // Find order by transaction ID
    const order = await Order.findOne({ transactionId: tran_id });

    if (!order) {
      logger.error("Order not found for transaction", { tran_id });
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check payment status
    if (status === "VALID" || status === "VALIDATED") {
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
      order.validationId = val_id;
      order.cardBrand = card_brand;
      await order.save();

      logger.info("Payment confirmed", { orderId: order._id });

      // Send payment confirmation email
      const user = await User.findById(order.userId);
      if (user) {
        await sendPaymentConfirmation(order, user.email, amount);
      }

      return NextResponse.json({
        message: "Payment confirmed",
        orderId: order._id,
      });
    } else if (status === "FAILED" || status === "CANCELLED") {
      order.paymentStatus = "failed";
      order.status = "Failed";
      await order.save();

      logger.warn("SSLCommerz payment failed", { orderId: order._id, status });

      return NextResponse.json({
        message: "Payment failed",
        orderId: order._id,
      });
    }

    return NextResponse.json({
      message: "Webhook processed",
    });
  } catch (error) {
    logger.error("SSLCommerz webhook error", { error: error.message });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
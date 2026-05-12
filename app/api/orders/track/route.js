// app/api/orders/track/route.js - Order Tracking API

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/mongodb";
import { logger } from "@/lib/logger";
import { sanitizeInput } from "@/lib/validation";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const trackingId = sanitizeInput(searchParams.get("trackingId") || "");

    if (!trackingId) {
      return NextResponse.json(
        { error: "Tracking ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ trackingId });

    if (!order) {
      logger.warn("Order not found for tracking", { trackingId });
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    logger.info("Order tracked", { trackingId, orderId: order._id });

    return NextResponse.json({
      orderId: order._id,
      trackingId: order.trackingId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || "pending",
      total: order.total,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      estimatedDelivery:
        order.status === "Shipped"
          ? new Date(order.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000)
          : null,
    });
  } catch (error) {
    logger.error("Tracking API error", { error: error.message });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

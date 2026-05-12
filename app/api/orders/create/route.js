// app/api/orders/create/route.js

import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { validateOrderData, sanitizeInput } from "@/lib/validation";
import { sendOrderConfirmation } from "@/lib/email";
import { logger } from "@/lib/logger";
import crypto from "crypto";

export async function POST(req) {
  try {
    await dbConnect();

    // Verify authentication
    const user = req.headers.get("user");
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = JSON.parse(user);
    const body = await req.json();

    // Validate order data
    const validation = validateOrderData(body);
    if (!validation.isValid) {
      logger.warn("Order validation failed", { errors: validation.errors });
      return NextResponse.json(
        { errors: validation.errors },
        { status: 400 }
      );
    }

    // Verify user owns this order
    if (body.userId !== userData.userId) {
      logger.warn("Unauthorized order creation attempt", { userId: userData.userId });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get user email
    const userDoc = await User.findById(userData.userId);
    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify items and check stock
    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          },
          { status: 400 }
        );
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Generate tracking ID
    const trackingId = `TRK-${Date.now()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    // Create order
    const order = await Order.create({
      userId: body.userId,
      items: body.items,
      total: body.total,
      paymentMethod: body.paymentMethod.toLowerCase(),
      trackingId,
      status: "Pending",
      shippingAddress: body.shippingAddress || null,
      phone: sanitizeInput(body.phone),
    });

    logger.info("Order created successfully", {
      orderId: order._id,
      userId: body.userId,
    });

    // Send confirmation email
    await sendOrderConfirmation(order, userDoc.email);

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          id: order._id,
          trackingId: order.trackingId,
          total: order.total,
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Order creation error", { error: error.message });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
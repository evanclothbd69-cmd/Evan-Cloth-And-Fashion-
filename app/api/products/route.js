// app/api/products/route.js (Updated with validation)

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { validateProductData, sanitizeInput } from "@/lib/validation";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find();
    return NextResponse.json(products);
  } catch (error) {
    logger.error("Error fetching products", { error: error.message });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // Check authentication
    const user = req.headers.get("user");
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = JSON.parse(user);

    // Check admin role
    const adminUser = await dbConnect();
    // Add role check logic here

    const body = await req.json();

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(body.name),
      description: sanitizeInput(body.description),
      price: parseFloat(body.price),
      category: sanitizeInput(body.category),
      stock: parseInt(body.stock),
      image: body.image,
      featured: body.featured || false,
    };

    // Validate data
    const validation = validateProductData(sanitizedData);
    if (!validation.isValid) {
      logger.warn("Product validation failed", { errors: validation.errors });
      return NextResponse.json(
        { errors: validation.errors },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create(sanitizedData);

    logger.info("Product created", { productId: product._id });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logger.error("Error creating product", { error: error.message });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
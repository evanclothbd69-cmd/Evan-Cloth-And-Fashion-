// app/api/auth/register/route.js (Updated)

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { validateUserData, sanitizeInput } from "@/lib/validation";
import { sendWelcomeEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(body.name),
      email: sanitizeInput(body.email).toLowerCase(),
      password: body.password,
    };

    // Validate input
    const validation = validateUserData(sanitizedData);
    if (!validation.isValid) {
      logger.warn("Registration validation failed", { errors: validation.errors });
      return NextResponse.json(
        { errors: validation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: sanitizedData.email,
    });

    if (existingUser) {
      logger.warn("Registration attempt with existing email", {
        email: sanitizedData.email,
      });
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(sanitizedData.password, 10);

    // Create user
    const user = await User.create({
      name: sanitizedData.name,
      email: sanitizedData.email,
      password: hashedPassword,
      role: "user",
      emailVerified: false,
    });

    logger.info("New user registered", { userId: user._id, email: user.email });

    // Send welcome email
    await sendWelcomeEmail(sanitizedData.name, sanitizedData.email);

    return NextResponse.json(
      {
        message: "Registration successful. Welcome email sent.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
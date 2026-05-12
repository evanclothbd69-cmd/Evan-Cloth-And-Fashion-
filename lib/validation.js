// lib/validation.js - Input validation schemas

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateProductData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push("Product name must be at least 3 characters");
  }
  if (!data.price || data.price < 0) {
    errors.push("Product price must be a positive number");
  }
  if (!data.category || data.category.trim().length === 0) {
    errors.push("Product category is required");
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.push("Product description must be at least 10 characters");
  }
  if (data.stock < 0) {
    errors.push("Stock cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateOrderData = (data) => {
  const errors = [];

  if (!data.userId || data.userId.trim().length === 0) {
    errors.push("User ID is required");
  }
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Order must contain at least one item");
  }
  if (!data.total || data.total < 0) {
    errors.push("Order total must be a positive number");
  }
  if (
    !data.paymentMethod ||
    !["sslcommerz", "bkash", "nagad", "cod"].includes(
      data.paymentMethod.toLowerCase()
    )
  ) {
    errors.push(
      "Invalid payment method. Must be: sslcommerz, bkash, nagad, or cod"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUserData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }
  if (!validateEmail(data.email)) {
    errors.push("Invalid email format");
  }
  if (!validatePassword(data.password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 500);
};
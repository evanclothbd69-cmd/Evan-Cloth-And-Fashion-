// lib/email.js - Email notification service

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOrderConfirmation(orderData, userEmail) {
  try {
    const itemsList = orderData.items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">৳${item.price}</td>
      </tr>`
      )
      .join("");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>
        
        <p><strong>Order ID:</strong> ${orderData._id}</p>
        <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
        
        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
          </tr>
          ${itemsList}
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px;"><strong>৳${orderData.total}</strong></td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;"><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
        <p><strong>Status:</strong> ${orderData.status}</p>
        
        <p style="margin-top: 20px;">You can track your order using ID: <strong>${orderData.trackingId}</strong></p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          For support, contact: support@evantextiles.com
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmation - ${orderData._id}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendShippingUpdate(orderData, userEmail) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Shipping Update</h2>
        <p>Your order has been shipped!</p>
        
        <p><strong>Order ID:</strong> ${orderData._id}</p>
        <p><strong>Tracking ID:</strong> ${orderData.trackingId}</p>
        <p><strong>Status:</strong> ${orderData.status}</p>
        
        <p style="margin-top: 20px;">You can track your shipment using the tracking ID above on our website.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          For support, contact: support@evantextiles.com
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Shipping Update - Order ${orderData._id}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentConfirmation(orderData, userEmail, amount) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Received</h2>
        <p>Your payment has been successfully processed!</p>
        
        <p><strong>Order ID:</strong> ${orderData._id}</p>
        <p><strong>Amount Paid:</strong> ৳${amount}</p>
        <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <p style="margin-top: 20px;">Your order is now confirmed and will be processed soon.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          For support, contact: support@evantextiles.com
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Payment Confirmation - Order ${orderData._id}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(userName, userEmail) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Evan Clothes & Fashion!</h2>
        <p>Hi ${userName},</p>
        
        <p>Thank you for registering with us. We're excited to have you as part of our fashion community!</p>
        
        <p>You can now:</p>
        <ul>
          <li>Browse our exclusive collections</li>
          <li>Add items to your cart</li>
          <li>Track your orders</li>
          <li>Manage your profile</li>
        </ul>
        
        <p style="margin-top: 20px;">Happy shopping!</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          For support, contact: support@evantextiles.com
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Welcome to Evan Clothes & Fashion!",
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
}
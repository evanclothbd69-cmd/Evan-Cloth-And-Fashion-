# Setup Instructions for Production-Ready Features

## 1. Install Required Dependencies

```bash
npm install jose nodemailer
```

## 2. Environment Variables

Update your `.env.local` file with:

```env
# Email Configuration (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password  # Use App Password, not regular password

# JWT Secret (Generate a strong random string)
NEXTAUTH_SECRET=your_very_secure_random_string_here
```

### How to Get Gmail App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select Mail and Windows Computer
3. Copy the generated password
4. Use it as EMAIL_PASSWORD

## 3. New Files Created

- `middleware.js` - Authentication middleware for protected routes
- `lib/validation.js` - Input validation schemas
- `lib/logger.js` - Logging utility
- `lib/email.js` - Email notification service
- `app/api/auth/login/route.js` - Secure login endpoint
- `app/api/orders/create/route.js` - Secure order creation
- `app/api/sslcommerz/webhook/route.js` - SSLCommerz payment webhook
- `app/api/bkash/webhook/route.js` - bKash payment webhook
- `app/api/nagad/webhook/route.js` - Nagad payment webhook

## 4. Updated Models

- `models/User.js` - Added fields: phone, address, city, country, zipCode, emailVerified, verificationToken, profileImage
- `models/Order.js` - Added payment tracking fields and transaction IDs

## 5. Security Features Implemented

✅ JWT-based authentication
✅ Input validation and sanitization
✅ Password hashing (bcryptjs)
✅ Protected admin routes
✅ Payment webhook verification
✅ Error logging
✅ CSRF protection (via secure cookies)
✅ XSS prevention (input sanitization)
✅ SQL injection prevention (MongoDB validation)

## 6. Email Notifications

Automatically sends emails for:
- User registration (welcome email)
- Order confirmation
- Payment confirmation
- Shipping updates

## 7. Payment Webhook Setup

### SSLCommerz
Update webhook URL in dashboard to:
`https://yourdomain.com/api/sslcommerz/webhook`

### bKash
Update webhook URL to:
`https://yourdomain.com/api/bkash/webhook`

### Nagad
Update webhook URL to:
`https://yourdomain.com/api/nagad/webhook`

## 8. Testing Endpoints

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Create Order (requires auth token)
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
        "name": "Product Name",
        "price": 100,
        "quantity": 2
      }
    ],
    "total": 200,
    "paymentMethod": "sslcommerz",
    "phone": "01234567890"
  }'
```

## 9. Production Checklist

- [ ] Set strong NEXTAUTH_SECRET
- [ ] Configure email credentials
- [ ] Set correct webhook URLs in payment gateways
- [ ] Enable HTTPS
- [ ] Test all payment flows
- [ ] Set up error monitoring (Sentry)
- [ ] Enable logging in production
- [ ] Test email notifications
- [ ] Verify authentication works
- [ ] Deploy to Vercel

## 10. Support & Debugging

Check logs for any errors:
```bash
npm run dev
# Logs will appear in console
```

For production errors, set up Sentry:
```bash
npm install @sentry/nextjs
```

## 11. Next Steps

1. Implement email verification
2. Add password reset functionality
3. Implement 2FA
4. Add inventory management alerts
5. Create admin panel for order management
6. Add customer reviews and ratings
7. Implement wishlists
8. Add coupon/discount system
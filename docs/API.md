# Build8Now — Complete API Documentation

> **Interactive Swagger UI:** http://localhost:4000/api/docs  
> **Base URL:** http://localhost:4000/api/v1  
> **Auth:** All protected routes require Authorization: Bearer <access_token>

---

## Response Envelope

All responses use a consistent JSON envelope:

`json
// Success
{
  "success": true,
  "data": { ... }
}

// Success with pagination
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "quantity", "message": "Expected number, received string" }
    ]
  }
}
`

---

## HTTP Status Code Reference

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid/expired token) |
| 403 | Forbidden (valid token, insufficient role or ownership) |
| 404 | Not Found |
| 409 | Conflict (duplicate, e.g. email already exists) |
| 422 | Unprocessable Entity (business rule violation) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 1. Authentication (/api/v1/auth)

### POST /auth/register
Register a new user.
- **Auth:** None
- **Body:**
`json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
`
- **Roles allowed in registration:** CUSTOMER, INFLUENCER (Admin created via seed only)
- **Response 201:** { user: { id, email, firstName, lastName, role }, accessToken, refreshToken }

### POST /auth/login
- **Auth:** None
- **Body:** { "email": "...", "password": "..." }
- **Response 200:** { user, accessToken, refreshToken }

### POST /auth/refresh
- **Auth:** None
- **Body:** { "refreshToken": "..." }
- **Response 200:** { accessToken, refreshToken } (old refresh token is revoked)

### POST /auth/logout
- **Auth:** Bearer token (any role)
- **Body:** { "refreshToken": "..." }
- **Response 200:** { message: "Logged out successfully" }

---

## 2. Shipping Profiles (/api/v1/shipping)

### GET /shipping/profiles
List all shipping profiles with their rules.
- **Auth:** Admin
- **Query:** ?page=1&limit=20&isActive=true
- **Response 200:** Array of profiles + rules

### GET /shipping/profiles/:id
Get a single shipping profile.
- **Auth:** Admin

### POST /shipping/profiles
Create a new shipping profile.
- **Auth:** Admin
- **Body:**
`json
{
  "name": "Heavy Goods — Slab Rate",
  "description": "For items over 50kg with distance-based slabs",
  "minimumCharge": 200.00,
  "maximumCharge": 5000.00
}
`

### PUT /shipping/profiles/:id
Update a profile (name, description, min/max charges).
- **Auth:** Admin

### DELETE /shipping/profiles/:id
Deactivate a profile (soft delete — sets isActive: false).
- **Auth:** Admin
- **Note:** Products assigned to an inactive profile will receive an error on shipping calculation.

### POST /shipping/profiles/:id/rules
Add a calculation rule to a profile.
- **Auth:** Admin
- **Body:**
`json
{
  "metric": "WEIGHT",
  "calculationType": "SLAB",
  "minValue": 0,
  "maxValue": 50,
  "fixedCharge": 150.00,
  "rate": 0,
  "priority": 1,
  "isActive": true
}
`
- **metric values:** WEIGHT | QUANTITY | PRICE | DISTANCE | LENGTH | WIDTH | HEIGHT | VOLUME | AREA
- **calculationType values:**
  - FLAT — fixed charge regardless of input value
  - PER_UNIT — ate × inputValue
  - SLAB — applies if minValue ≤ inputValue < maxValue; charge = ixedCharge + (rate × inputValue)
  - PERCENTAGE — (rate / 100) × inputValue

### POST /shipping/calculate
Calculate shipping cost for a product.
- **Auth:** Any authenticated user (or public)
- **Body:**
`json
{
  "productId": "uuid",
  "quantity": 5,
  "distance": 25.5,
  "weight": 120.0
}
`
- **Response 200:**
`json
{
  "success": true,
  "data": {
    "productId": "...",
    "shippingProfileId": "...",
    "currency": "INR",
    "inputs": { "quantity": 5, "distance": "25.50", "weight": "120.00" },
    "rules": [
      { "metric": "WEIGHT", "calculationType": "SLAB", "input": "120.00", "charge": "350.00" },
      { "metric": "DISTANCE", "calculationType": "PER_UNIT", "input": "25.50", "charge": "127.50" }
    ],
    "subtotal": "477.50",
    "minimumAdjustment": "0.00",
    "maximumAdjustment": "0.00",
    "total": "477.50"
  }
}
`

### PUT /products/:id/shipping-profile
Assign a shipping profile to a product.
- **Auth:** Admin
- **Body:** { "shippingProfileId": "uuid" }

---

## 3. Orders (/api/v1/orders)

### POST /orders
Create a new pending order.
- **Auth:** Customer, Admin
- **Body:**
`json
{
  "items": [
    { "productId": "uuid", "quantity": 10 }
  ]
}
`
- **Response 201:** Full order with order items, subtotal, total

### GET /orders
List orders.
- **Auth:** Admin (all orders), Customer (own orders only)
- **Query:** ?page=1&limit=20&status=PENDING

### GET /orders/:id
Get order details.
- **Auth:** Admin (any order), Customer (own order only — 403 otherwise)

### POST /orders/:id/confirm
Confirm order and automatically award loyalty points to linked influencer.
- **Auth:** Admin only
- **Idempotent:** Calling this twice has no additional effect (idempotencyKey prevents duplicate points).
- **Response 200:** Updated order + loyalty award summary

### POST /orders/:id/cancel
Cancel order and reverse all awarded loyalty points.
- **Auth:** Admin only
- **Response 200:** Updated order + reversal summary

### POST /orders/:id/refund
Partial or full refund with proportional point reversal.
- **Auth:** Admin only
- **Body:**
`json
{
  "items": [
    { "orderItemId": "uuid", "quantity": 3 }
  ]
}
`
- **Response 200:** Updated order + proportional reversal summary

---

## 4. Loyalty System (/api/v1/loyalty)

### POST /loyalty/rules
Create a loyalty point rule.
- **Auth:** Admin
- **Body:**
`json
{
  "name": "10% back on all Cement",
  "scopeType": "CATEGORY",
  "categoryId": "uuid",
  "pointsType": "PERCENTAGE",
  "pointsValue": 10,
  "minPurchaseValue": 500,
  "priority": 5,
  "isActive": true
}
`
- **scopeType:** PRODUCT | CATEGORY | DEFAULT
- **pointsType:** FIXED | PERCENTAGE | PER_CURRENCY_AMOUNT
  - FIXED — awards pointsValue flat points per line item
  - PERCENTAGE — awards (pointsValue/100) × lineTotal points
  - PER_CURRENCY_AMOUNT — awards (lineTotal / pointsValue) points (e.g. 1 point per ₹10)

### GET /loyalty/balance
Get authenticated influencer's current point balance.
- **Auth:** Influencer (own), Admin (any)
- **Response 200:** { "influencerId": "...", "balance": "2450.00" }

### GET /loyalty/ledger
Get paginated transaction history.
- **Auth:** Influencer (own), Admin (any)
- **Query:** ?page=1&limit=20
- **Response 200:**
`json
{
  "data": [
    {
      "id": "...",
      "transactionType": "EARN",
      "points": "250.00",
      "orderId": "...",
      "description": "Points for order confirm",
      "createdAt": "2026-10-01T..."
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
`

---

## 5. Influencers & Referrals

### POST /influencers
Register a user as an influencer.
- **Auth:** Admin
- **Body:** { "userId": "uuid", "type": "ARCHITECT" }
- **	ype values:** ARCHITECT | CONTRACTOR | INTERIOR_DESIGNER | BUILDER | OTHER

### GET /influencers
List all influencers.
- **Auth:** Admin

### GET /influencers/:id
Get influencer details.
- **Auth:** Admin, Influencer (own only)

### POST /referrals
Link a customer to an influencer.
- **Auth:** Admin
- **Body:** { "customerId": "uuid", "influencerId": "uuid" }
- **Note:** A customer can only have one influencer. Attempting a second link returns 409 Conflict.

### GET /referrals/my-customers
Get list of customers referred by the authenticated influencer.
- **Auth:** Influencer (own only)

---

## 6. Products (/api/v1/products)

### GET /products
- **Auth:** Any | **Query:** ?page=1&limit=20&categoryId=uuid&isActive=true

### GET /products/:slug
- **Auth:** Any

### POST /products
- **Auth:** Admin
- **Body:**
`json
{
  "name": "UltraTech Cement 53 Grade",
  "slug": "ultratech-cement-53-grade",
  "sku": "UTC-53-50KG",
  "description": "High-strength OPC cement...",
  "price": 420.00,
  "brand": "UltraTech",
  "categoryId": "uuid",
  "shippingProfileId": "uuid",
  "defaultWeight": 50.0,
  "imageUrl": "https://..."
}
`

### PUT /products/:id
- **Auth:** Admin

### DELETE /products/:id (soft delete)
- **Auth:** Admin

---

## 7. Categories (/api/v1/categories)

### GET /categories — Auth: Any
### POST /categories — Auth: Admin
### PUT /categories/:id — Auth: Admin
### DELETE /categories/:id — Auth: Admin
# API Walkthrough Examples

1. **Calculate Shipping (POST /api/v1/shipping/calculate)**
```json
{
  "productId": "some-uuid",
  "quantity": 2,
  "weight": 10,
  "distance": 25
}
```

2. **Confirm Order (PATCH /api/v1/orders/:id/confirm)**
Automatically triggers the Loyalty Engine and appends EARN entries to the ledger idempotently.

3. **Refund Item (POST /api/v1/orders/:id/refunds)**
```json
{
  "refunds": [{ "orderItemId": "...", "quantity": 1 }]
}
```
Creates a REVERSAL entry in the ledger proportionally.
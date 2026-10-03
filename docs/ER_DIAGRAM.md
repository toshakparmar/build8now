# ER Diagram — Build8Now Assignment

> Full entity-relationship diagram for the database schema defined in ackend/prisma/schema.prisma.

---

## Mermaid ER Diagram

`mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        enum role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    SESSION {
        uuid id PK
        uuid userId FK
        string refreshToken UK
        datetime expiresAt
        datetime createdAt
    }

    INFLUENCER {
        uuid id PK
        uuid userId FK UK
        enum type
        datetime createdAt
        datetime updatedAt
    }

    CUSTOMER_INFLUENCER_REFERRAL {
        uuid id PK
        uuid customerId UK
        uuid influencerId FK
        datetime createdAt
    }

    CATEGORY {
        uuid id PK
        string name
        string slug UK
        datetime createdAt
        datetime updatedAt
    }

    SHIPPING_PROFILE {
        uuid id PK
        string name
        string description
        boolean isActive
        decimal minimumCharge
        decimal maximumCharge
        datetime createdAt
        datetime updatedAt
    }

    SHIPPING_RULE {
        uuid id PK
        uuid shippingProfileId FK
        enum metric
        enum calculationType
        decimal minValue
        decimal maxValue
        decimal rate
        decimal fixedCharge
        int priority
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT {
        uuid id PK
        string name
        string slug UK
        string sku UK
        string description
        decimal price
        string brand
        uuid categoryId FK
        uuid shippingProfileId FK
        decimal defaultWeight
        decimal defaultLength
        decimal defaultWidth
        decimal defaultHeight
        string imageUrl
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        uuid id PK
        uuid customerId FK
        enum status
        decimal subtotal
        decimal total
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEM {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        int quantity
        decimal unitPrice
        decimal lineTotal
        int refundedQuantity
        datetime createdAt
        datetime updatedAt
    }

    LOYALTY_RULE {
        uuid id PK
        string name
        enum scopeType
        uuid productId FK
        uuid categoryId FK
        decimal minPurchaseValue
        decimal maxPurchaseValue
        enum pointsType
        decimal pointsValue
        int priority
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    LOYALTY_LEDGER {
        uuid id PK
        uuid influencerId FK
        uuid orderId
        uuid orderItemId
        enum transactionType
        decimal points
        uuid relatedLedgerId
        string idempotencyKey UK
        string description
        datetime createdAt
    }

    USER ||--o{ SESSION : "has sessions"
    USER ||--o| INFLUENCER : "is an influencer"
    USER ||--o{ ORDER : "places orders"

    INFLUENCER ||--o{ CUSTOMER_INFLUENCER_REFERRAL : "has referrals"
    INFLUENCER ||--o{ LOYALTY_LEDGER : "has ledger entries"

    CATEGORY ||--o{ PRODUCT : "contains"
    CATEGORY ||--o{ LOYALTY_RULE : "applies to"

    SHIPPING_PROFILE ||--o{ SHIPPING_RULE : "has rules"
    SHIPPING_PROFILE ||--o{ PRODUCT : "assigned to"

    PRODUCT ||--o{ ORDER_ITEM : "appears in"
    PRODUCT ||--o{ LOYALTY_RULE : "applies to"

    ORDER ||--o{ ORDER_ITEM : "contains"
`

---

## Constraints & Indexes Summary

| Table | Constraint | Type | Reason |
|---|---|---|---|
| USER.email | UNIQUE | DB | Prevent duplicate accounts |
| SESSION.refreshToken | UNIQUE | DB | One-to-one token lookup |
| INFLUENCER.userId | UNIQUE | DB | One influencer record per user |
| CUSTOMER_INFLUENCER_REFERRAL.customerId | UNIQUE | DB | One referral per customer |
| CATEGORY.slug | UNIQUE | DB | Clean URLs |
| PRODUCT.slug | UNIQUE | DB | SEO-friendly URLs |
| PRODUCT.sku | UNIQUE | DB | Inventory uniqueness |
| LOYALTY_LEDGER.idempotencyKey | UNIQUE | DB | Prevent duplicate point awards |
| ORDER.customerId | FK + INDEX | DB | Efficient customer order lookups |
| ORDER_ITEM.orderId | FK + INDEX | DB | Fast item fetch per order |
| LOYALTY_LEDGER.influencerId | FK + INDEX | DB | Fast balance/ledger queries |
| PRODUCT.categoryId | FK + INDEX | DB | Category filter performance |
| PRODUCT.shippingProfileId | FK + INDEX | DB | Profile lookup on calculate |

All monetary fields (price, 	otal, subtotal, lineTotal, unitPrice, points, etc.) use DECIMAL(10,2) — **never FLOAT** — to avoid floating-point rounding errors in financial calculations.
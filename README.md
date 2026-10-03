# Build8Now — Full Stack + Technical SEO Developer
## Technical Screening Assignment Submission

---

## 👤 Applicant Profile

| Field | Details |
|---|---|
| **Name** | Toshak Parmar |
| **Profile** | Freelance Full-Stack Developer |
| **Expertise** | Node.js · TypeScript · PostgreSQL · Next.js · REST APIs · Technical SEO |
| **Company Website** | [Home \| Build8Now](https://build8now.com) |
| **Submission Date** | October 2026 |

---

## 🎥 Walkthrough Video

**[▶ Watch the 3–5 Minute Walkthrough on Loom](https://www.loom.com/share/8fe0f5c903454b2fb10df49a6b4bd81a)**

> The walkthrough covers: server startup, Swagger docs, shipping calculation (multi-rule, min/max, slabs), loyalty award on order confirm, duplicate idempotency block, partial refund reversal, role-based access (401/403), the SEO product page (view-source, JSON-LD, breadcrumbs), and the full Jest test suite run.

---

## 1. Architecture Overview

This repository contains the complete implementation for the Build8Now technical assignment, demonstrating depth in backend design, data modelling, business logic, security, testing, and Technical SEO.

### Stack Choices & Justification

| Layer | Technology | Reason |
|---|---|---|
| **Runtime** | Node.js + Express.js | Explicitly preferred; lightweight and fast for REST APIs |
| **Language** | TypeScript (strict mode) | Type safety, better IDE support, fewer runtime surprises |
| **Database** | PostgreSQL via Supabase | Relational integrity, DECIMAL for money, PgBouncer pooling |
| **ORM** | Prisma v5 | Type-safe queries, migration management, prevents SQL injection |
| **Frontend/SEO** | Next.js 14 (App Router) | SSR/SSG required for SEO; generateMetadata, JSON-LD, sitemap |
| **Auth** | JWT (access + refresh) | Stateless access tokens + DB-backed refresh for revocation |
| **Validation** | Zod | Runtime schema validation with TypeScript inference |
| **Testing** | Jest + ts-jest | Standard, widely supported, great mocking capabilities |
| **Logging** | Pino | Structured JSON logging, fast, production-ready |
| **API Docs** | Swagger/OpenAPI | Interactive documentation at /api/docs |

### Folder Structure

`
build8now-assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Source of truth for all DB models
│   │   ├── migrations/         # Prisma migration history
│   │   └── seed.ts             # Seed data (one user per role + products)
│   ├── src/
│   │   ├── config/             # env.ts (Zod-validated), logger.ts
│   │   ├── common/             # Shared error classes, response helpers
│   │   ├── middleware/         # auth.middleware, validate.middleware, error.middleware
│   │   ├── lib/                # prisma.ts (singleton client)
│   │   ├── docs/               # swagger.ts (OpenAPI spec)
│   │   ├── routes/             # index.ts (router assembly)
│   │   └── modules/
│   │       ├── auth/           # register, login, refresh, logout
│   │       ├── shipping/       # profiles, rules, calculate
│   │       ├── orders/         # CRUD + confirm/cancel/refund workflows
│   │       ├── loyalty/        # rules, influencers, referrals, ledger, balance
│   │       ├── products/       # product CRUD + profile assignment
│   │       ├── categories/     # category CRUD
│   │       ├── influencers/    # influencer management
│   │       ├── referrals/      # referral linking
│   │       └── users/          # user profile
│   └── tests/
│       ├── unit/               # Pure logic tests (no DB) — mocked Prisma
│       └── integration/        # Service-level tests
├── frontend/
│   └── app/
│       ├── products/[slug]/    # SEO product page (SSR, JSON-LD, OG)
│       ├── sitemap.ts          # Dynamic XML sitemap
│       ├── robots.ts           # robots.txt generator
│       └── not-found.tsx       # Custom 404
├── docs/
│   ├── API.md                  # Complete REST endpoint reference
│   ├── ER_DIAGRAM.md           # Full Mermaid ER diagram
│   └── WALKTHROUGH.md          # Script for walkthrough video
├── README.md
├── SECURITY.md
└── SEO.md
`

---

## 2. Key Design Decisions

### 2.1 Shipping Rule Combination Logic

All active rules in a profile are **summed** after independent evaluation. This is documented here for clarity:

1. Each rule is evaluated independently against its metric (WEIGHT, QUANTITY, PRICE, DISTANCE, VOLUME, AREA, etc.).
2. Rules whose metric value is missing from the request payload are **silently skipped** (not an error).
3. SLAB rules only apply if the metric value falls within [minValue, maxValue). Boundary is inclusive at min, exclusive at max.
4. All applicable rule charges are **summed** into a subtotal.
5. The subtotal is then clamped by minimumCharge (floor) and maximumCharge (ceiling) at the profile level.
6. Derived dimensions: olume = length × width × height, rea = length × width. These are auto-computed from the product's defaults if not supplied in the request.
7. Final result is rounded to 2 decimal places (INR currency).

### 2.2 Loyalty Rule Precedence

When multiple loyalty rules match an order item, the **highest-priority specificity wins**:

`
Product-specific rule  →  highest priority (scopeType = PRODUCT)
       ↓
Category-specific rule →  second priority  (scopeType = CATEGORY)
       ↓
Default rule           →  fallback          (scopeType = DEFAULT)
`

Within the same scope level, the rule with the highest priority integer wins. Only **one rule fires per line item**.

### 2.3 Idempotency

- Each loyalty ledger entry has a **database-level UNIQUE constraint** on idempotencyKey.
- The key format is order:{orderId}:item:{orderItemId}.
- If the same order-confirm is retried, the create() call raises a Prisma unique constraint error which is caught and treated as a no-op — no points are double-awarded.
- This is a **DB-level guarantee**, not just an in-code check.

### 2.4 Append-Only Ledger

The LoyaltyLedger table is **never updated or deleted**. All mutations are new rows:
- **EARN** → order confirmed
- **REVERSAL** → cancel or refund (references the original ledger ID in 
elatedLedgerId)
- **ADJUSTMENT** → manual admin correction (future)
- **REDEMPTION** → points spent (not yet built; see Scope Cuts)

The current balance is always derived as SUM(points) across all ledger rows for an influencer, where EARN/ADJUSTMENT are positive and REVERSAL/REDEMPTION are negative.

### 2.5 Redemption Safety (Documented, Not Built)

If a reversal is requested for an order whose points have already been partially/fully redeemed, the system will still issue the full REVERSAL (it will not block). The balance may go negative. In production, a separate "minimum balance" check would prevent redemption of already-reversed points, or a separate "available balance" calculation (EARN - REVERSAL - REDEMPTION) would be surfaced. The raw ledger is always auditable.

---

## 3. Setup & Run Instructions

### Prerequisites
- Node.js v18 or higher
- A Supabase project (or any PostgreSQL instance) — connection strings in .env

### Step 1: Clone & Configure

`ash
git clone <your-repo-url>
cd build8now-assignment
`

Copy and fill in environment variables:
`ash
# Root-level .env for reference
cp .env.example .env
cd backend && cp ../.env.example .env
`

### Step 2: Backend

`ash
cd backend
npm install
npx prisma generate          # Generate Prisma client
npx prisma db push           # Push schema to your DB (creates tables)
npm run seed                 # Seed: 3 users (Admin/Customer/Influencer) + products + rules
npm run dev                  # Starts on http://localhost:4000
`

Swagger docs available at: **http://localhost:4000/api/docs**

### Step 3: Frontend (SEO Demo)

`ash
cd frontend
npm install
npm run dev                  # Starts on http://localhost:3000
`

Visit: **http://localhost:3000/products/ultratech-cement-53-grade**

---

## 4. Automated Tests

Tests use **Jest + ts-jest** with all Prisma calls mocked (no live DB required).

`ash
cd backend
npm test
`

### Test Coverage Areas

| Area | File | Description |
|---|---|---|
| Shipping calculation | 	ests/unit/shipping.test.ts | Multi-rule, slabs, min/max, missing inputs, inactive profile |
| Loyalty point calculation | 	ests/unit/loyalty.test.ts | FIXED, PERCENTAGE, PER_CURRENCY, rule precedence |
| Idempotency | 	ests/unit/idempotency.test.ts | Duplicate order → zero points, no DB write |
| Refund / reversal | 	ests/unit/refund.test.ts | Partial refund proportional reversal |
| Auth & authorization | 	ests/unit/auth.test.ts | JWT verify, 401 vs 403, object-level ownership |
| Input validation | 	ests/unit/validation.test.ts | Zod schema edge cases, negative/zero/missing values |

---

## 5. Database Design

See **[docs/ER_DIAGRAM.md](./docs/ER_DIAGRAM.md)** for the full Mermaid entity-relationship diagram.

Key design decisions:
- All monetary values use DECIMAL(10,2) — never FLOAT.
- All IDs are UUIDs (@default(uuid())).
- LoyaltyLedger.idempotencyKey has a DB-level UNIQUE constraint.
- Session.refreshToken is unique — one refresh token per session.
- CustomerInfluencerReferral.customerId is unique — one influencer per customer.

---

## 6. API Documentation

Full endpoint reference: **[docs/API.md](./docs/API.md)**  
Interactive Swagger UI: **http://localhost:4000/api/docs**

All responses follow a consistent envelope:

`json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
`

---

## 7. Security

See **[SECURITY.md](./SECURITY.md)** for full details.

Summary: bcrypt password hashing, JWT access (15m) + refresh (7d) tokens with DB-backed revocation, Zod input validation, Prisma parameterized queries (no SQL injection), Helmet security headers, rate limiting, CORS whitelisting, object-level ownership checks.

---

## 8. Technical SEO

See **[SEO.md](./SEO.md)** for full details.

Summary: Next.js App Router SSR, dynamic generateMetadata, Product JSON-LD + BreadcrumbList schema, Open Graph + Twitter Card tags, canonical URL, dynamic sitemap.xml, robots.txt, custom 404, 301 redirect middleware, 
ext/image for CWV optimization.

---

## 9. Scope Cuts (Honest Gaps)

| Item | Status | Reason |
|---|---|---|
| Loyalty point redemption flow | ❌ Not built | Excluded from scope per instructions (no cart/checkout) |
| Full Admin UI | ❌ Not built | Frontend focused on SEO demo; all admin actions via API |
| Docker Compose | ❌ Removed | Using live Supabase; easier for reviewer to run without Docker |
| Distance-based rules validation | ⚠️ Partial | Out-of-range distance silently skips; could be a hard error |
| E2E tests | ❌ Not built | Time constraint; unit + integration tests cover core logic |
| Email notifications | ❌ Not built | Out of scope |
| Pagination on all list endpoints | ⚠️ Partial | Orders + Ledger paginated; profiles/rules return full list |

---

## 10. Seed Data Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@build8now.com | Admin@1234 |
| Customer | customer@build8now.com | Customer@1234 |
| Influencer | influencer@build8now.com | Influencer@1234 |

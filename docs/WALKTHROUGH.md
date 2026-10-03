# Build8Now Technical Assignment - Walkthrough Script

## 0:00–0:25 Architecture Overview
"Welcome to the Build8Now technical walkthrough. The backend is built with Express.js and TypeScript, utilizing PostgreSQL and Prisma for strict data modeling and referential integrity. The frontend is a Next.js App Router application focused on SEO. Everything is orchestrated via Docker Compose."

## 0:25–0:55 Authentication & Swagger
"The API is fully documented via Swagger at `/api/docs`. Let's demonstrate the authentication flow. We use a secure JWT strategy with short-lived access tokens and longer-lived refresh tokens stored in the database. Notice that passwords are securely hashed using bcrypt."

## 0:55–1:40 Shipping Profile & Calculation
"Moving to the shipping engine, all logic is purely data-driven. I've configured a profile with multiple active rules: a flat fee, a per-unit weight charge, and distance slabs. When we hit the `/api/v1/shipping/calculate` endpoint, you can see how it independently evaluates the valid rules, sums them up, applies minimum/maximum constraints, and returns a fully auditable breakdown of charges."

## 1:40–2:30 Loyalty System & Confirming Orders
"For loyalty, I've configured product-specific and category-specific rules. We have an Influencer referred by this Customer. When we confirm the order, the system processes the highest-precedence rule and awards points. Let's look at the Influencer's ledger: you'll see a new 'EARN' transaction, and their total balance is dynamically aggregated."

## 2:30–2:50 Idempotency Check
"A critical requirement is idempotency. If I attempt to process that same order again—perhaps due to a network retry—the database unique constraint on the `idempotencyKey` immediately rejects it. No duplicate points are awarded, ensuring strict ledger integrity."

## 2:50–3:25 Partial Refunds
"What happens during a return? Let's refund 3 items out of the 10 purchased. The backend calculates the exact fractional amount of points to reverse and safely appends a 'REVERSAL' transaction to the ledger without mutating the original historical 'EARN' record. The balance accurately reflects this deduction."

## 3:25–3:50 Authorization & RBAC
"For security, Role-Based Access Control limits admin operations. If I try to access the shipping profile management as a Customer, the middleware safely rejects it with a 403 Forbidden. The same applies for object-level ownership checks on orders."

## 3:50–4:25 Next.js SEO
"Finally, let's look at the Next.js frontend. Navigating to the UltraTech Cement product page, you can see it's fully Server-Side Rendered. If we view the source, all meta tags, Canonical URLs, and Open Graph data are present. The JSON-LD for the Product and Breadcrumbs is natively embedded for Google rich snippets. A 301 permanent redirect correctly forwards traffic from the legacy URL, and a 404 is cleanly thrown for invalid slugs."

## 4:25–5:00 Tests
"To ensure correctness, the Jest test suite validates shipping boundary logic, loyalty precedence, and idempotency race conditions. As you can see, all tests pass successfully. Thank you for your time."
# Security Documentation — Build8Now Assignment

> This document covers every security control implemented in the backend service.

---

## 1. Password Hashing

- **Algorithm:** crypt with a **cost factor of 12** (configurable via env).
- Passwords are hashed before storage using crypt.hash(password, 12).
- Comparison uses crypt.compare() — timing-safe by design.
- **Raw passwords are never logged, stored, or returned in any API response.**

---

## 2. JWT Authentication (Access + Refresh Token Strategy)

### Access Token
- **Algorithm:** HS256
- **Expiry:** 15 minutes (configurable via JWT_ACCESS_EXPIRES_IN env var)
- **Payload:** { sub: userId, role: Role }
- Sent in every request Authorization: Bearer <token> header.
- Never stored in a cookie or localStorage from the server side.

### Refresh Token
- **Algorithm:** HS256
- **Expiry:** 7 days (configurable via JWT_REFRESH_EXPIRES_IN env var)
- **Storage:** Hashed value is stored in the Session table with an expiresAt timestamp.
- On POST /api/v1/auth/refresh: the token is verified cryptographically, then the DB session is looked up to confirm it hasn't been revoked.
- On POST /api/v1/auth/logout: the corresponding Session row is deleted, immediately revoking the refresh token.
- **Rotation:** A new refresh token is issued on every refresh call; the old session is deleted.

### Secret Management
- JWT secrets are **never hard-coded**. They are loaded exclusively from environment variables.
- The .env file is in .gitignore and will never be committed.
- An .env.example with placeholder values is provided for reference.

---

## 3. Role-Based Access Control (RBAC)

Three roles are enforced: **Admin**, **Customer**, **Influencer**.

| Action | Admin | Customer | Influencer |
|---|---|---|---|
| Manage shipping profiles/rules | ✅ | ❌ | ❌ |
| Manage loyalty rules | ✅ | ❌ | ❌ |
| Confirm / cancel / refund orders | ✅ | ❌ | ❌ |
| Create orders | ✅ | ✅ | ❌ |
| View own orders | ✅ | ✅ (own only) | ❌ |
| View influencer balance/ledger | ✅ | ❌ | ✅ (own only) |
| View referred customers | ✅ | ❌ | ✅ (own only) |

### Middleware Chain
1. uthenticate — verifies JWT signature + expiry → 401 Unauthorized if invalid/missing.
2. uthorize(...roles) — checks eq.user.role against allowed roles → 403 Forbidden if role not permitted.
3. **Object-level ownership** — inside the service layer, eq.user.id is compared against the resource's owner ID. A Customer cannot retrieve another Customer's orders even with a valid token.

### HTTP Status Codes
- 401 — No token, expired token, or malformed token.
- 403 — Valid token but insufficient role or ownership violation.

---

## 4. Input Validation & Sanitisation

- **Library:** [Zod](https://zod.dev) — all request bodies and path/query parameters pass through a Zod schema validated by alidate.middleware.ts before reaching the controller.
- Validation errors return 400 Bad Request with a structured list of field-level issues.
- String fields are trimmed; numeric fields are coerced and range-checked (e.g., negative quantities rejected).
- No raw user input is ever interpolated into query strings.

---

## 5. SQL Injection Prevention

- **Prisma ORM** generates fully parameterized queries. User input is never string-concatenated into SQL.
- No raw SQL ($queryRaw) is used anywhere in this codebase.
- Prisma's type-safe API makes accidental injection structurally impossible.

---

## 6. Sensitive Data Protection

| Category | Control |
|---|---|
| Password hashes | Never returned in any API response; selected columns exclude passwordHash |
| JWT tokens | Never logged; pino-http edact paths configured |
| Refresh tokens | Stored hashed concept; raw value never persisted in plain text in logs |
| Database URL | Only in .env; excluded from version control |
| Error messages | Internal errors (stack traces) are suppressed in production responses |

---

## 7. Rate Limiting

- **Library:** express-rate-limit
- **Default:** 100 requests per 15-minute window per IP.
- Configurable via RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS env vars.
- Returns 429 Too Many Requests when exceeded.

---

## 8. Security Headers

- **Library:** helmet (enabled globally, all defaults active).
- Key headers set: X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Strict-Transport-Security, Content-Security-Policy, X-XSS-Protection.

---

## 9. CORS

- cors middleware is configured to allow only the FRONTEND_URL environment variable origin.
- credentials: true is set to allow the Authorization header from the frontend.
- All other origins receive a CORS error, preventing unauthorized cross-origin requests.

---

## 10. Request Body Size Limit

- Express JSON body parser limited to 1mb to mitigate request-flooding / memory exhaustion.

---

## 11. Database-Level Idempotency

- LoyaltyLedger.idempotencyKey has a UNIQUE constraint at the database level.
- Even under concurrent load (race conditions), the DB will reject the second insert with a unique violation, which is caught and treated as a no-op.
- This is a **stronger guarantee** than an in-code if (exists) return check.

---

## 12. What I Would Add in Production

- **Argon2** instead of bcrypt (more memory-hard, resistant to GPU attacks).
- **Refresh token rotation with reuse detection** (if a previously used refresh token is presented, all sessions for that user are immediately revoked — indicating token theft).
- **Audit logging** of all admin mutations (who changed what, and when).
- **HTTPS-only** enforcement at the load balancer / reverse proxy layer.
- **IP-based anomaly detection** for login attempts.
- **Secrets management** via AWS Secrets Manager or HashiCorp Vault instead of .env files.
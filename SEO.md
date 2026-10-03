# Technical SEO Documentation — Build8Now Assignment

> This document explains every Technical SEO decision made for the sample Build8Now product page (/products/[slug]), built with **Next.js 14 App Router**.

---

## 1. Implemented SEO Features

### 1.1 Server-Side Rendering (SSR)

The product page at pp/products/[slug]/page.tsx is a **React Server Component**. It fetches product data at request time from the backend API and renders fully-formed HTML — crawlers receive a complete DOM, not an empty shell waiting for JavaScript.

**Why this matters:** Googlebot can execute JavaScript, but SSR guarantees that content is indexed immediately without requiring a second rendering pass, improving crawl budget efficiency.

---

### 1.2 SEO-Friendly URLs (Slug-Based)

Products are accessed via human-readable, keyword-rich slugs:
`
/products/ultratech-cement-53-grade
/products/tata-tiscon-500d-tmt-bars
`
Slugs are stored in the database with a UNIQUE constraint and generated from the product name (lowercased, hyphenated).

---

### 1.3 Dynamic Title & Meta Description

The generateMetadata() async function fetches product data at the server level and returns:

`	ypescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  return {
    title: ${product.name} | Buy  Online — Build8Now,
    description: Order  at the best price. ...,
  };
}
`

- Title follows the pattern: [Product Name] | Buy [Brand] Online — Build8Now
- Description is capped at ~155 characters
- Both are **unique per product**, not templated with identical content

---

### 1.4 Canonical URL

`	ypescript
canonical: https://build8now.com/products/
`

Prevents duplicate-content penalties when the same page is accessible via query strings (e.g., ?ref=social&utm_source=...). The canonical always points to the clean slug URL.

---

### 1.5 JSON-LD Structured Data

Two separate JSON-LD schemas are embedded as <script type="application/ld+json">:

**Product + Offer schema:**
`json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "UltraTech Cement 53 Grade",
  "description": "...",
  "brand": { "@type": "Brand", "name": "UltraTech" },
  "image": "https://...",
  "offers": {
    "@type": "Offer",
    "price": "420.00",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "url": "https://build8now.com/products/ultratech-cement-53-grade"
  }
}
`

**BreadcrumbList schema:**
`json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://build8now.com" },
    { "@type": "ListItem", "position": 2, "name": "Cement", "item": "https://build8now.com/categories/cement" },
    { "@type": "ListItem", "position": 3, "name": "UltraTech Cement 53 Grade" }
  ]
}
`

These enable **Google rich results**: star ratings, price in SERPs, breadcrumb trails under the result.

---

### 1.6 Open Graph & Twitter Card Tags

`	ypescript
openGraph: {
  title: product.name,
  description: product.description,
  url: https://build8now.com/products/,
  images: [{ url: product.imageUrl, alt: product.name }],
  type: 'website',
},
twitter: {
  card: 'summary_large_image',
  title: product.name,
  description: product.description,
  images: [product.imageUrl],
},
`

Ensures rich link previews when shared on LinkedIn, Twitter/X, WhatsApp, and Slack.

---

### 1.7 Visible Breadcrumbs

HTML breadcrumb trail rendered in the page body for users:
`html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/categories/cement">Cement</a></li>
    <li aria-current="page">UltraTech Cement 53 Grade</li>
  </ol>
</nav>
`

- Uses ria-label and ria-current for accessibility
- Matches the BreadcrumbList JSON-LD data exactly

---

### 1.8 Image Alt Text

All 
ext/image components include descriptive alt text:
`	sx
<Image
  src={product.imageUrl}
  alt={${product.name} —  construction material}
  width={600}
  height={400}
  priority
/>
`

---

### 1.9 Dynamic XML Sitemap (pp/sitemap.ts)

`	ypescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchAllActiveProducts();
  return [
    { url: 'https://build8now.com', lastModified: new Date(), priority: 1.0 },
    ...products.map(p => ({
      url: https://build8now.com/products/,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
`

Accessible at: https://build8now.com/sitemap.xml

---

### 1.10 robots.txt (pp/robots.ts)

`	ypescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://build8now.com/sitemap.xml',
  };
}
`

---

### 1.11 404 Handling

If a product slug does not exist in the database, 
otFound() is called from Next.js, which:
- Returns an HTTP 404 status (not a soft 404)
- Renders pp/not-found.tsx — a custom, branded 404 page
- Prevents Googlebot from indexing dead URLs

---

### 1.12 301 Redirect Example

Configured in 
ext.config.ts:
`	ypescript
async redirects() {
  return [
    {
      source: '/products/ultratech-ppc-cement',    // Old slug
      destination: '/products/ultratech-cement-53-grade', // New slug
      permanent: true,  // → HTTP 301 Moved Permanently
    },
  ];
}
`

This preserves link equity (PageRank) when a product slug changes.

---

### 1.13 Core Web Vitals & Performance

| Optimization | Implementation |
|---|---|
| **LCP** | Hero image uses priority prop → preloaded, no lazy loading delay |
| **CLS** | Explicit width and height on all 
ext/image components → no layout shift |
| **INP** | Minimal client-side JavaScript (RSC = no hydration overhead) |
| **TTFB** | Server Component fetch + Supabase pooled connection |
| **Font loading** | 
ext/font/google with display: 'swap' → no invisible text flash |
| **Image format** | 
ext/image auto-converts to WebP/AVIF for modern browsers |
| **Bundle size** | No client components on product page; zero unnecessary JS shipped |

---

## 2. What I Would Do Next in Production

| Priority | Action |
|---|---|
| 🔴 High | **ISR (Incremental Static Regeneration):** evalidate: 3600 on product pages. Serve from CDN edge, regenerate in background when product data changes |
| 🔴 High | **Image CDN:** Cloudinary or Imgix for responsive images at scale (srcset across breakpoints) |
| 🟠 Medium | **301 Redirect Database:** A DB table of old_slug → new_slug mappings with Next.js middleware to issue redirects dynamically, rather than static config |
| 🟠 Medium | **hreflang tags** for multi-region support (e.g., Hindi/English versions) |
| 🟠 Medium | **Category/listing page pagination SEO:** el="next" / el="prev" link tags |
| 🟡 Low | **Structured data testing** integration in CI (Google's Rich Results Test API) |
| 🟡 Low | **Core Web Vitals monitoring** with Vercel Analytics or Lighthouse CI |
| 🟡 Low | **Video schema** if product demo videos are added |
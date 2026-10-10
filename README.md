# Prixna IT Solution — Premium Business Technology Website

Static, zero-dependency website for **Prixna IT Solution Pvt. Ltd.**
(Jadibuti-32, Koteshwor, Kathmandu, Nepal). No build step, no database —
deploy the folder as-is to any shared hosting, cPanel, or GitHub Pages.

## Run locally

```powershell
npx serve .
# or
node -e "require('http').createServer(require('serve-handler'))"
```

Any static server works. `file://` preview also works (no `fetch()` calls anywhere).

## Edit without touching code

| Task | File |
|---|---|
| Phone, WhatsApp, email, address, hours | `js/config.js` |
| Products, prices (NPR), stock, warranty | `js/data.js` → `products[]` (`stock`: `in` / `low` / `out` / `quote`) |
| Connect a form backend / CRM webhook | `js/config.js` → `formEndpoint` (POSTs lead JSON) |
| Connect Google Analytics | `js/config.js` → `analyticsId` (auto-loads gtag) |
| Navigation / footer links | `js/main.js` → `NAV` array (single source) |

Header, footer, and every lead form render from these files — edit once, update everywhere.

## Admin panel (`admin.html`)

No-code management for staff, in 7 tabs: **Dashboard** (KPIs + conversion events),
**Leads** (pipeline, follow-ups, assignees, CSV/JSON), **Products** (full catalog CRUD —
name, price/MRP in NPR, stock, category, warranty), **Testimonials** (add genuine,
client-approved reviews; only approved ones show on the homepage), **Homepage content**
(hero text, buttons, trust badges, final CTA), **Site settings** (phone, WhatsApp,
email, address, hours, links, analytics/form endpoints), **Backup & publish**.

How publishing works: edits apply instantly in the current browser (localStorage
`prixna_cms_v1`, merged at runtime by `js/main.js`). To make them permanent and
visible to all visitors: Backup tab → **Download data.js / config.js** → upload to
hosting, replacing the old files (keep a copy first). Optional staff PIN lock lives
in the Backup tab — a casual browser lock, not real security.

## Lead system

- Every form validates (name, phone, optional email), has a honeypot + minimum-fill-time
  spam trap, requires consent, and saves **for real** to the on-device lead inbox.
- Confirmation shows a genuine reference ID (`L-…`) plus a WhatsApp handoff link.
- Staff inbox: `admin.html` (excluded from search via `robots.txt` + `noindex`) —
  status pipeline, follow-up dates, assignees, history, CSV/JSON export/import,
  and a conversion-event table. **Device-local only**: export weekly, avoid shared PCs.
- UTM/campaign attribution is captured automatically (`utm_source/medium/campaign`).

## Backup & rollback

- `backup/pre-redesign` branch points at the pre-build state (empty repo, first commit).
- Roll back with: `git reset --hard backup/pre-redesign` (or cherry-pick files back).

## Truthfulness rules (do not break)

- Jigri ERP / CRM / eHajiri are **request-demo / coming soon only** — never sellable.
- Only verified facts: Google rating 4.5 (8 reviews), real address/phone, JigriTools free suite.
- Case-study placeholders are explicitly labelled — never present them as real work.

## Deploy checklist

1. Upload all files preserving folder structure.
2. Point `https://prixnaitsolution.com.np/` at the folder; submit `sitemap.xml` to Search Console.
3. Set `formEndpoint` / `analyticsId` in `js/config.js` when credentials exist.
4. Test: consultation form → lead appears in `admin.html` on the same browser.

# KIBrueder, Deploy & Workflow

Static HTML site built with Eleventy + Tailwind. Source lives in `site/`. Production output is `_site/`.

## Connect GitHub → Netlify (one-time)

1. Open [Netlify](https://app.netlify.com) and select the site that owns **kibrueder.de** (or create a new site).
2. **Site configuration → Build & deploy → Continuous deployment → Link repository**
   - Repository: `yarolgek/KIB-SEO`
   - Branch: `main`
3. Confirm build settings (already in [`netlify.toml`](netlify.toml)):
   - **Build command:** `npm run build`
   - **Publish directory:** `_site`
   - **Node version:** 20
4. **Site configuration → Environment variables**, add if you use the newsletter:
   - `SUPABASE_URL`, your Supabase project URL
   - `SUPABASE_ANON_KEY`, public anon key (RLS-protected)
5. Trigger a deploy (push to `main` or “Deploy site”).

## Daily workflow (Cursor → Live)

```bash
# 1. Preview locally
npm run dev
# → http://localhost:8080

# 2. Edit pages under site/
#    Shared layout: site/_includes/
#    Styles: site/css/input.css
#    Scripts: site/js/

# 3. Commit & push
git add .
git commit -m "Update homepage copy"
git push origin main

# 4. Netlify builds & deploys automatically (~1–2 min)
```

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local preview with live reload |
| `npm run build` | Production build → `_site/` |
| `npm run preview` | Serve `_site/` locally |

## Forms

- **Contact** → Netlify Forms (`name="contact"` on `/kontakt/`). Enable email alerts under **Netlify → Forms → Form notifications**.
- **Newsletter** → Supabase `newsletter_subscriptions` + optional Make.com webhook (needs env vars above)

## Language

- German is the default in all HTML (SEO).
- Core pages load `js/i18n.js` for an EN/DE toggle (German stays in the HTML source).

## Privacy / Analytics

- Google Analytics loads only after cookie accept (`site/js/main.js`).
- Privacy copy: `/datenschutz/`

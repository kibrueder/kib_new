# KIBrueder Marketing (kibrueder.de)

Static HTML website for [kibrueder.de](https://kibrueder.de), Local SEO & marketing agency in Mönchengladbach.

## Stack

- **Eleventy (11ty)**, HTML pages with shared Nunjucks layouts
- **Tailwind CSS**, compiled to a single CSS file at build time
- **Vanilla JS**, theme, mobile nav, cookie banner, forms, EN/DE toggle
- **Netlify**, build + CDN hosting from GitHub

Source: `site/` · Build output: `_site/`

## Quick start

```bash
npm install
npm run dev          # http://localhost:8080
npm run build        # production → _site/
```

## Deploy

See **[DEPLOY.md](DEPLOY.md)** for GitHub → Netlify setup and the day-to-day Cursor workflow.

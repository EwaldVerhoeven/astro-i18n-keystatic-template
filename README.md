# **PROJECT_NAME**

Klant-/projectsite gebouwd met de `astro-i18n-keystatic-template`.

## Stack

- [Astro 6](https://astro.build) — static site generator met server-output voor Keystatic admin
- TypeScript (strictest preset)
- Vanilla CSS met design tokens in [src/styles/global.css](src/styles/global.css)
- i18n via Astro's `[lang]` routing (NL/EN standaard, uitbreidbaar)
- 11 herbruikbare secties; pagina's = sectielijsten in JSON
<!-- IF:KEYSTATIC -->
- [Keystatic Cloud](https://keystatic.cloud) als CMS — `__KEYSTATIC_PROJECT__`
  <!-- ENDIF:KEYSTATIC -->
  <!-- IF:NETLIFY -->
- Deploy: [Netlify](https://netlify.com) (auto-deploy bij push naar `main`)
<!-- ENDIF:NETLIFY -->

## Quick start

```bash
nvm use            # of: node --version (>= 22.12)
npm install
npm run dev
```

Open <http://localhost:4321> — wordt geredirect naar `/__DEFAULT_LANG__/`.

<!-- IF:KEYSTATIC -->

Admin: <http://localhost:4321/keystatic> (vereist "Allow local development" in je Keystatic Cloud project-instellingen).

<!-- ENDIF:KEYSTATIC -->

## Scripts

| Command           | Doel                                       |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start dev-server (Astro + Keystatic admin) |
| `npm run build`   | Productiebuild naar `dist/`                |
| `npm run preview` | Preview van de productiebuild              |
| `npm run check`   | TypeScript + Astro type-check              |
| `npm run lint`    | ESLint over het project                    |
| `npm run format`  | Prettier-formattering toepassen            |

## Projectstructuur

```
src/
├── components/
│   ├── layout/        Nav, Footer, BaseLayout, LanguagePicker
│   ├── sections/      11 herbruikbare secties
│   ├── JsonLd.astro   Helper voor structured data
│   └── SectionRenderer.astro   Dispatcher
├── content/
│   ├── pages/<lang>/  Pagina-entries als JSON (sectielijsten)
<!-- IF:BLOG -->
│   ├── blog/<lang>/   Blog posts (markdown)
<!-- ENDIF:BLOG -->
│   └── globals/       Site-config (Organization, analytics, etc.)
├── i18n/              Vertaalbestanden (nl.json, en.json) + utils
├── lib/               site.ts + sections/ (types + registry, single source of truth)
├── pages/             Astro routes ([lang]/[...slug], blog, 404)
└── styles/global.css  Design tokens + base styles
```

## Een nieuwe pagina toevoegen

<!-- IF:KEYSTATIC -->

**Via Keystatic admin (aanbevolen voor klanten):**

1. Open `/keystatic` in je browser
2. Klik op "Pages (NL)" → "Add Page"
3. Vul titel, slug, SEO-velden en translationKey in
4. Voeg secties toe via "Add block"
5. Save — Keystatic Cloud committeert de JSON naar de repo
<!-- ENDIF:KEYSTATIC -->

**Via git (developer-workflow):**

1. Kopieer `src/content/pages/__DEFAULT_LANG__/home.json` naar bv. `over-ons.json`
2. Pas `slug`, `title`, `translationKey` en `sections` aan
3. Doe hetzelfde voor andere talen met dezelfde `translationKey`

URL wordt automatisch `/<lang>/<slug>/`.

## Een nieuwe sectie ontwikkelen

Zie [CLAUDE.md](CLAUDE.md) sectie "Nieuwe sectie toevoegen" voor de exacte stappen (schema → component → registry-entry).

<!-- IF:BLOG -->

## Blog

Posts staan als markdown in `src/content/blog/<lang>/`. Frontmatter-velden:

```yaml
---
title: 'Titel'
description: 'Korte omschrijving (verschijnt in lijsten en meta-description)'
pubDate: 2026-01-15
readTime: 5
lang: nl
---
```

URL volgt de bestandsnaam: `mijn-post.md` → `/nl/blog/mijn-post/`.

<!-- ENDIF:BLOG -->

## SEO

- Meta description per pagina (verplicht in Keystatic schema, min. 50 chars)
- Open Graph + Twitter Card tags (auto)
- `hreflang` tussen taalversies (gekoppeld via `translationKey`)
- Sitemap: `/sitemap-index.xml` (auto, multi-language)
- `robots.txt` in `public/`. Zet `SITE_ENV=staging` om alles op `noindex` te zetten voor previewbuilds.
- JSON-LD: `Organization` site-breed (uit `globals/site.json`), `FAQPage` / `Review` / `Product+Offer` auto-gegenereerd per sectie waar relevant.

## Analytics

Nog niet meegeleverd in v1 — zie [CLAUDE.md](CLAUDE.md) sectie "Bekende v1-gaps" voor toelichting en implementatie-aanpak.

<!-- IF:NETLIFY -->

## Deploy

Auto-deploy via Netlify bij push naar `main`.

> ⚠ **Let op:** elke push naar `main` triggert een Netlify build die credits kost (build minutes, bandwidth, function invocations). Bouw lokaal eerst (`npm run build`), push bewust.

Configuratie:

- `netlify.toml` regelt build command + redirect van `/` → `/__DEFAULT_LANG__/`
- `@astrojs/netlify` adapter draait Keystatic admin als serverless function
- Contact form via Netlify Forms (zie ContactForm-sectie)
<!-- ENDIF:NETLIFY -->

<!-- IF:!NETLIFY -->

## Deploy

> **TODO:** Deze template is geconfigureerd zonder Netlify. Configureer je hosting provider:
>
> - Voor Vercel: `npm install @astrojs/vercel` + update `astro.config.mjs`
> - Voor zelf-hosting (Node): `@astrojs/node` met `mode: 'standalone'`
> - Voor pure static: `output: 'static'` (alleen zonder Keystatic admin)

<!-- ENDIF:!NETLIFY -->

## Licentie

ISC

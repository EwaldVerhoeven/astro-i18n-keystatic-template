# Changelog

All notable changes to `astro-i18n-keystatic-template` will be documented here. Format follows [Keep a Changelog](https://keepachangelog.com/), versioning is [SemVer](https://semver.org/).

## [Unreleased]

## [0.1.0] — 2026-05-29

Eerste publieke release. Volledige v1-toolkit.

### Added

- Astro 6.4.2 + TypeScript strictest foundation
- i18n via `[lang]` routing (NL + EN, uitbreidbaar)
- Vanilla CSS design tokens in `src/styles/global.css`
- BaseLayout met SEO-baseline: meta tags, Open Graph, Twitter Card, hreflang, JSON-LD
- Sitemap (`@astrojs/sitemap`) met multilang annotaties
- Robots.txt met `SITE_ENV=staging` toggle
- 11 herbruikbare secties: Hero, RichText, FeatureGrid, CTA, FAQ, Testimonials, BlogPreview, Pricing, ImageText, LogoWall, ContactForm
- Auto-JSON-LD per sectie: FAQPage, Review, Product+Offer, Article (blog)
- Pagina-architectuur: page-as-section-list (Keystatic blocks)
- Section registry als single source of truth (registry → Keystatic config + dispatcher)
- Blog content collection met list + detail routes
- Keystatic Cloud CMS-integratie met per-language collections
- `setup.sh`: interactief + non-interactief, 3 feature-toggles (Keystatic, Blog, Netlify)
- `setup.sh` IF/ENDIF processing voor README/CLAUDE.md
- Volledige README en CLAUDE.md (laatste bevat Netlify-deploy guardrail + bekende v1-gaps)
- ESLint (flat config + astro-plugin) + Prettier, met `--check` in CI
- CI matrix: shellcheck + lint + baseline-build + 8 toggle-combinaties
- Post-setup verification script (`scripts/verify-setup.sh`)

### Implementation notes (afwijkingen t.o.v. het oorspronkelijke ontwerp)

- **Astro 6.4.2 i.p.v. 6.3.8.** De SSR-adapters (`@astrojs/node` 10.1.x) targeten Astro 6.4.x's hernoemde
  `createRequestFromNodeRequest`-export; op 6.3.8 brak de node-standalone adapter-swap.
- **RichText gebruikt een eigen, dependency-vrije Astro document-renderer** i.p.v. Keystatic's
  `DocumentRenderer` (React, zou `@astrojs/react` vereisen). Dit houdt de page-pipeline React-vrij en maakt
  de RichText-sectie onafhankelijk van `@keystatic`, zodat de Keystatic-toggle beide packages volledig kan
  verwijderen.
- **Site-globals worden via een gevalideerde directe JSON-import** (`src/lib/site.ts`) gelezen i.p.v. een
  content collection — Astro's `file()`-loader past niet op een platte Keystatic-singleton.
- **Content-pagina's zijn prerendered** (`export const prerender = true`); alleen de Keystatic-admin draait
  als SSR-functie. Section-JSON-LD wordt inline in de sectie gerenderd (geldig voor SEO; named-slot-forwarding
  werkt niet door `SectionRenderer` heen).
- **Zod** wordt geïmporteerd uit `astro/zod` (niet het deprecated `z` re-export uit `astro:content`).

### Known limitations

- Analytics nog niet meegeleverd — CLAUDE.md instrueert agents om dit proactief uit te vragen bij eerste sessie in een afgeleid project
- Geen geneste secties (flat list only)
- `<Image>` van `astro:assets` alleen voor build-time-known assets; CMS-uploaded images gebruiken `<img>` met expliciete loading/fetchpriority
- `BreadcrumbList` JSON-LD niet geïmplementeerd — moot in v1 (alleen homepage entries als seed); volgt in v0.2 wanneer eerste non-home pagina's worden toegevoegd
- Extra talen voorbij NL/EN vereisen handmatige config (`LOCALES` in `astro.config.mjs` + Keystatic collection)
- Free tier Keystatic Cloud: 3 users per team (Pro plan vereist boven die grens)

[0.1.0]: https://github.com/EwaldVerhoeven/astro-i18n-keystatic-template/releases/tag/v0.1.0

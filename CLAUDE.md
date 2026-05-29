# CLAUDE.md — __PROJECT_NAME__

Project gegenereerd uit [`EwaldVerhoeven/astro-i18n-keystatic-template`](https://github.com/EwaldVerhoeven/astro-i18n-keystatic-template).
Dit bestand is voor AI-coding agents (Claude Code en vergelijkbaar). Mens-georiënteerde uitleg staat in [README.md](README.md).

## Stack

- Astro 6.4.2 (SSG met server-output voor Keystatic admin)
- TypeScript strictest preset
- Vanilla CSS met design tokens (`src/styles/global.css`)
- i18n via Astro's `[lang]` routing
- Content collections in `src/content/`
<!-- IF:KEYSTATIC -->
- Keystatic Cloud CMS, project: `__KEYSTATIC_PROJECT__`
<!-- ENDIF:KEYSTATIC -->
<!-- IF:NETLIFY -->
- Hosting: Netlify (auto-deploy bij push naar `main`)
<!-- ENDIF:NETLIFY -->

## Content-architectuur (kritiek voor begrip)

Pagina's worden opgeslagen als JSON in `src/content/pages/<lang>/<slug>.json` met deze vorm:

```json
{
  "title": "...",
  "slug": "...",
  "lang": "nl",
  "translationKey": "<unique-id-shared-with-other-language-versions>",
  "seo": { "description": "...", ... },
  "sections": [ { "_type": "hero", ... }, { "_type": "richText", ... } ]
}
```

`SectionRenderer` itereert over `sections[]` en dispatcht naar componenten op basis van `_type`
(via `src/lib/sections/registry.ts` — de single source of truth).
Eerste Hero-sectie claimt `<h1>`; vervolgsecties starten op `<h2>`.

`translationKey` koppelt taalversies van dezelfde pagina (gebruikt voor `hreflang`).

Site-globals (`src/content/globals/site.json`) worden gelezen via een gevalideerde directe import in
`src/lib/site.ts` (niet via `getCollection`) — dat past beter bij een platte Keystatic-singleton dan
Astro's `file()` content-loader.

<!-- IF:KEYSTATIC -->
Keystatic-admin bewerkt diezelfde JSON-bestanden. Cloud committeert wijzigingen naar de repo via een GitHub App.
<!-- ENDIF:KEYSTATIC -->

## Nieuwe sectie toevoegen

1. **Schema + types:** Maak `src/lib/sections/<name>.ts` met TS-interface en `_type: '<name>'` discriminator.
2. **Component:** Maak `src/components/sections/<Name>.astro` — accepteert props uit de TS-interface plus `lang` + `headingLevel`. Gebruik BEM class-names en design tokens uit `global.css`.
3. **Registry:** Voeg één regel toe aan `src/lib/sections/registry.ts` (import + objectliteral-entry).
<!-- IF:KEYSTATIC -->
4. **Keystatic schema:** Voeg een `<name>Block = fields.object(...)` toe aan `keystatic.config.ts` en registreer in beide `pagesNL`/`pagesEN` collections onder `sections: fields.blocks({ ... })`.
<!-- ENDIF:KEYSTATIC -->
5. **(Optioneel) Seed-fixture:** Voeg een voorbeeld toe in `src/content/pages/<lang>/home.json`.

Registry, dispatcher en (optioneel) Keystatic-admin werken daarna automatisch.

## Rich text rendering

De RichText-sectie rendert de Keystatic document-AST met een **dependency-vrije Astro-renderer**
(`src/components/sections/RichTextNode.astro` + `RichTextMarks.astro`, types in `src/lib/sections/document.ts`).
Keystatic's eigen `DocumentRenderer` is een React-component en zou `@astrojs/react` vereisen; de Astro-renderer
houdt de page-pipeline React-vrij (lichtere statische output) en maakt de RichText-sectie onafhankelijk van
`@keystatic`, zodat de Keystatic-toggle beide packages volledig kan verwijderen.

## Astro 6 API-afwijkingen

- Slug uit content entry: `post.id` (niet `post.slug` — Astro 6 verandering)
- Markdown render: `import { render } from 'astro:content'` en dan `const { Content } = await render(post)` (niet `post.render()`)
- Content config: `src/content.config.ts` (niet `src/content/config.ts`)
- Zod importeren uit `astro/zod` (niet het deprecated `z` re-export uit `astro:content`)

## i18n gebruik

```ts
import { useTranslations, getLangFromUrl } from '@/i18n/utils';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
// t('nav.home') → "Home" afhankelijk van lang
// t('blog.readTime', { minutes: 5 }) → "5 min leestijd"
```

Een taal toevoegen:
1. Voeg `xx.json` toe in `src/i18n/`
2. Update `languages` object in `src/i18n/utils.ts`
3. Update `i18n.locales` (de `LOCALES`-const) in `astro.config.mjs`
4. Voeg een Keystatic collection toe voor pages in die taal (zie pattern van pagesNL/pagesEN)

<!-- IF:NETLIFY -->
## Netlify deployment guardrail

**Push naar `main` triggert een Netlify-build die credits kost.** Build minutes, bandwidth en function invocations tellen mee in het Netlify-quotum.

Regels:
1. Werk lokaal met `npm run dev`
2. Bouw lokaal eerst (`npm run build`) om te valideren
3. Push of merge **nooit** naar `main` zonder expliciete toestemming van de gebruiker
4. Bij twijfel: vraag eerst

Deze guardrail geldt ook voor toegevoegde branches die naar `main` mergen via PR.
<!-- ENDIF:NETLIFY -->

## SEO-velden (afgedwongen)

Elk page-entry **moet** een `seo.description` van minstens 50 karakters bevatten (validatie in `src/content.config.ts`). Andere SEO-velden zijn optioneel met sensible defaults uit `src/content/globals/site.json`.

`SectionRenderer` garandeert exact één `<h1>` per pagina (de eerste Hero-sectie, of de page-titel uit BaseLayout als er geen Hero is).

## Bekende v1-gaps — proactief uitvragen

### Analytics (niet meegeleverd)

Bij eerste sessie in dit project, stel de gebruiker ongevraagd deze vragen:
- Wil je analytics op deze site? (default: ja, voor klantsites bijna altijd)
- Welke tool? (Plausible / GA4 / Fathom / Umami / geen)
- Cookie-consent vereist? (NL/EU: ja voor GA4, nee voor Plausible/Fathom)

Implementatie:
1. Maak `src/components/Analytics.astro` die alleen in `import.meta.env.PROD` rendert
2. Laad component in `BaseLayout` head-slot
3. Sla config op in `src/content/globals/site.json` (analytics-provider + site-id, schema is al voorzien)
4. Update README sectie "Analytics" met provider en site-id
5. **Verwijder deze "Bekende v1-gaps → Analytics" sectie uit dit bestand zodra geïmplementeerd**

## Conventies

- BEM voor CSS class-namen (`.hero`, `.hero__title`, `.hero--centered`)
- Vanilla CSS only — geen Tailwind, geen CSS-in-JS
- Design tokens via CSS custom properties — geen hardcoded kleuren/spacings in componenten
- Astro `<style>` blocks zijn scoped by default; gebruik `:global(...)` alleen voor markdown-content of slot-content
- Astro `<Image>` van `astro:assets` voor build-time-known assets; plain `<img>` met expliciete `loading`/`fetchpriority`/`decoding` voor CMS-uploaded images (in `public/`)
- TypeScript strictest — geen `any`, geen impliciete returns

## Pre-PR checklist (intern)

Voor commit/PR:
- [ ] `npm run check` slaagt
- [ ] `npm run build` slaagt
- [ ] `npm run lint` en `npm run format:check` slagen
- [ ] Geen achtergebleven placeholder-tokens (`__…__`) in tracked files
- [ ] Geen achtergebleven IF/ENDIF conditional-markers (template-only)
- [ ] Voor UI: handmatig in browser geverifieerd

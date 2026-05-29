import { defineConfig } from 'astro/config';

// The __SITE_URL__ / __DEFAULT_LANG__ placeholders are replaced by setup.sh.
// Until then, these guards keep `astro check` / `astro build` working on the
// raw template by falling back to valid defaults (a parseable URL + a locale
// that exists in `locales`). After setup.sh runs, the literals are real values.
const SITE_URL = '__SITE_URL__';
const DEFAULT_LANG = '__DEFAULT_LANG__';
const LOCALES = ['nl', 'en'];

const site = SITE_URL.startsWith('http') ? SITE_URL : 'https://example.com';
const defaultLocale = LOCALES.includes(DEFAULT_LANG) ? DEFAULT_LANG : 'nl';

export default defineConfig({
  site,
  output: 'server',
  i18n: {
    defaultLocale,
    locales: LOCALES,
    routing: {
      prefixDefaultLocale: true,
    },
  },
});

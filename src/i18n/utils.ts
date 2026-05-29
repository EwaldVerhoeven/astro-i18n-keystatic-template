import nl from './nl.json';
import en from './en.json';

export const languages = { nl: 'Nederlands', en: 'English' } as const;
export const defaultLang = 'nl' as const;

export type Lang = keyof typeof languages;
export type TranslationKey = keyof typeof nl;

const translations: Record<Lang, Record<string, string>> = { nl, en };

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in languages) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let value = translations[lang]?.[key] ?? translations[defaultLang][key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  };
}

export function getAllLangs(): Lang[] {
  return Object.keys(languages) as Lang[];
}

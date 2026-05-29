import { config, collection, singleton, fields } from '@keystatic/core';

const seoField = fields.object({
  title: fields.text({ label: 'SEO title (optional)', description: 'Falls back to page title' }),
  description: fields.text({
    label: 'Meta description',
    multiline: true,
    validation: { length: { min: 50 } },
  }),
  ogImage: fields.image({ label: 'OG image', directory: 'public/og', publicPath: '/og/' }),
  canonical: fields.url({ label: 'Canonical URL (optional)' }),
  noindex: fields.checkbox({ label: 'Hide from search engines', defaultValue: false }),
});

const heroBlock = fields.object({
  headline: fields.text({ label: 'Headline' }),
  subtitle: fields.text({ label: 'Subtitle', multiline: true }),
  ctaText: fields.text({ label: 'CTA text' }),
  ctaUrl: fields.text({ label: 'CTA URL' }),
  image: fields.object({
    src: fields.image({ label: 'Image', directory: 'public/sections', publicPath: '/sections/' }),
    alt: fields.text({ label: 'Alt text', validation: { length: { min: 1 } } }),
  }),
  variant: fields.select({
    label: 'Variant',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Centered', value: 'centered' },
    ],
    defaultValue: 'default',
  }),
});

const richTextBlock = fields.object({
  content: fields.document({
    label: 'Content',
    formatting: true,
    links: true,
    dividers: true,
    layouts: [],
  }),
  maxWidth: fields.select({
    label: 'Max width',
    options: [
      { label: 'Narrow (prose)', value: 'narrow' },
      { label: 'Default', value: 'default' },
    ],
    defaultValue: 'narrow',
  }),
});

const featureGridBlock = fields.object({
  eyebrow: fields.text({ label: 'Eyebrow' }),
  title: fields.text({ label: 'Title' }),
  columns: fields.select({
    label: 'Columns',
    options: [
      { label: '2', value: '2' },
      { label: '3', value: '3' },
      { label: '4', value: '4' },
    ],
    defaultValue: '3',
  }),
  features: fields.array(
    fields.object({
      title: fields.text({ label: 'Title' }),
      description: fields.text({ label: 'Description', multiline: true }),
      icon: fields.image({
        label: 'Icon',
        directory: 'public/sections/icons',
        publicPath: '/sections/icons/',
      }),
    }),
    { label: 'Features', itemLabel: (props) => props.fields.title.value || 'Feature' }
  ),
});

const ctaBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  description: fields.text({ label: 'Description', multiline: true }),
  primaryText: fields.text({ label: 'Primary button text' }),
  primaryUrl: fields.text({ label: 'Primary button URL' }),
  secondaryText: fields.text({ label: 'Secondary button text' }),
  secondaryUrl: fields.text({ label: 'Secondary button URL' }),
  variant: fields.select({
    label: 'Variant',
    options: [
      { label: 'Default', value: 'default' },
      { label: 'Inverted', value: 'inverted' },
    ],
    defaultValue: 'default',
  }),
});

const faqBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  items: fields.array(
    fields.object({
      question: fields.text({ label: 'Question' }),
      answer: fields.text({ label: 'Answer', multiline: true }),
    }),
    { label: 'Items', itemLabel: (p) => p.fields.question.value || 'Question' }
  ),
});

const testimonialsBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  layout: fields.select({
    label: 'Layout',
    options: [
      { label: 'Grid', value: 'grid' },
      { label: 'Single', value: 'single' },
    ],
    defaultValue: 'grid',
  }),
  items: fields.array(
    fields.object({
      quote: fields.text({ label: 'Quote', multiline: true }),
      authorName: fields.text({ label: 'Author name' }),
      authorRole: fields.text({ label: 'Author role' }),
      authorOrg: fields.text({ label: 'Organization' }),
      authorPhoto: fields.object({
        src: fields.image({
          label: 'Photo',
          directory: 'public/testimonials',
          publicPath: '/testimonials/',
        }),
        alt: fields.text({ label: 'Alt text' }),
      }),
      rating: fields.select({
        label: 'Rating',
        options: [
          { label: 'None', value: '' },
          { label: '1', value: '1' },
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
          { label: '5', value: '5' },
        ],
        defaultValue: '',
      }),
    }),
    { label: 'Testimonials', itemLabel: (p) => p.fields.authorName.value || 'Testimonial' }
  ),
});

const blogPreviewBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  limit: fields.integer({ label: 'Limit', defaultValue: 3, validation: { min: 1, max: 10 } }),
});

const pricingBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  plans: fields.array(
    fields.object({
      name: fields.text({ label: 'Plan name' }),
      price: fields.text({ label: 'Display price (e.g. €29)' }),
      priceAmount: fields.integer({ label: 'Numeric amount (for JSON-LD)' }),
      currency: fields.text({ label: 'Currency code (e.g. EUR)' }),
      interval: fields.select({
        label: 'Billing interval',
        options: [
          { label: 'One-time', value: 'once' },
          { label: 'Monthly', value: 'month' },
          { label: 'Yearly', value: 'year' },
        ],
        defaultValue: 'month',
      }),
      description: fields.text({ label: 'Description', multiline: true }),
      features: fields.array(fields.text({ label: 'Feature' }), { label: 'Features' }),
      ctaText: fields.text({ label: 'CTA text' }),
      ctaUrl: fields.text({ label: 'CTA URL' }),
      highlighted: fields.checkbox({ label: 'Highlight this plan', defaultValue: false }),
    }),
    { label: 'Plans', itemLabel: (p) => p.fields.name.value || 'Plan' }
  ),
});

const imageTextBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  body: fields.text({ label: 'Body', multiline: true }),
  image: fields.object({
    src: fields.image({ label: 'Image', directory: 'public/sections', publicPath: '/sections/' }),
    alt: fields.text({ label: 'Alt text' }),
  }),
  imagePosition: fields.select({
    label: 'Image position',
    options: [
      { label: 'Left', value: 'left' },
      { label: 'Right', value: 'right' },
    ],
    defaultValue: 'right',
  }),
  ctaText: fields.text({ label: 'CTA text' }),
  ctaUrl: fields.text({ label: 'CTA URL' }),
});

const logoWallBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  grayscale: fields.checkbox({ label: 'Grayscale', defaultValue: true }),
  logos: fields.array(
    fields.object({
      src: fields.image({ label: 'Logo', directory: 'public/logos', publicPath: '/logos/' }),
      alt: fields.text({ label: 'Alt text' }),
      url: fields.text({ label: 'Optional URL' }),
    }),
    { label: 'Logos', itemLabel: (p) => p.fields.alt.value || 'Logo' }
  ),
});

const contactFormBlock = fields.object({
  title: fields.text({ label: 'Title' }),
  description: fields.text({ label: 'Description', multiline: true }),
  submitText: fields.text({ label: 'Submit button text', defaultValue: 'Send' }),
  successRedirect: fields.text({ label: 'Success redirect URL (optional)' }),
});

export default config({
  storage: { kind: 'cloud' },
  cloud: { project: '__KEYSTATIC_PROJECT__' },
  singletons: {
    site: singleton({
      label: 'Site settings',
      path: 'src/content/globals/site',
      format: { data: 'json' },
      schema: {
        siteName: fields.text({ label: 'Site name' }),
        defaultOgImage: fields.image({
          label: 'Default OG image',
          directory: 'public/og',
          publicPath: '/og/',
        }),
        organization: fields.object({
          name: fields.text({ label: 'Organization name' }),
          logo: fields.image({ label: 'Logo', directory: 'public', publicPath: '/' }),
          url: fields.url({ label: 'URL' }),
          sameAs: fields.array(fields.url({ label: 'Profile URL' }), { label: 'Social profiles' }),
        }),
        googleSiteVerification: fields.text({ label: 'Google Site Verification token' }),
        analytics: fields.object({
          provider: fields.select({
            label: 'Provider',
            options: [
              { label: 'None', value: 'none' },
              { label: 'Plausible', value: 'plausible' },
              { label: 'Google Analytics 4', value: 'ga4' },
              { label: 'Fathom', value: 'fathom' },
              { label: 'Umami', value: 'umami' },
            ],
            defaultValue: 'none',
          }),
          siteId: fields.text({ label: 'Site / property ID' }),
        }),
      },
    }),
  },
  collections: {
    pagesNL: collection({
      label: 'Pages (NL)',
      slugField: 'slug',
      path: 'src/content/pages/nl/*',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Title' }),
        slug: fields.slug({ name: { label: 'Slug' } }),
        lang: fields.select({
          label: 'Language',
          options: [
            { label: 'NL', value: 'nl' },
            { label: 'EN', value: 'en' },
          ],
          defaultValue: 'nl',
        }),
        translationKey: fields.text({
          label: 'Translation key',
          description: 'Entries with the same key are translations of each other',
        }),
        seo: seoField,
        sections: fields.blocks(
          {
            hero: { label: 'Hero', schema: heroBlock },
            richText: { label: 'Rich text', schema: richTextBlock },
            featureGrid: { label: 'Feature grid', schema: featureGridBlock },
            cta: { label: 'CTA', schema: ctaBlock },
            faq: { label: 'FAQ', schema: faqBlock },
            testimonials: { label: 'Testimonials', schema: testimonialsBlock },
            blogPreview: { label: 'Blog preview', schema: blogPreviewBlock },
            pricing: { label: 'Pricing', schema: pricingBlock },
            imageText: { label: 'Image + text', schema: imageTextBlock },
            logoWall: { label: 'Logo wall', schema: logoWallBlock },
            contactForm: { label: 'Contact form', schema: contactFormBlock },
          },
          { label: 'Sections' }
        ),
      },
    }),
    pagesEN: collection({
      label: 'Pages (EN)',
      slugField: 'slug',
      path: 'src/content/pages/en/*',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Title' }),
        slug: fields.slug({ name: { label: 'Slug' } }),
        lang: fields.select({
          label: 'Language',
          options: [
            { label: 'NL', value: 'nl' },
            { label: 'EN', value: 'en' },
          ],
          defaultValue: 'en',
        }),
        translationKey: fields.text({ label: 'Translation key' }),
        seo: seoField,
        sections: fields.blocks(
          {
            hero: { label: 'Hero', schema: heroBlock },
            richText: { label: 'Rich text', schema: richTextBlock },
            featureGrid: { label: 'Feature grid', schema: featureGridBlock },
            cta: { label: 'CTA', schema: ctaBlock },
            faq: { label: 'FAQ', schema: faqBlock },
            testimonials: { label: 'Testimonials', schema: testimonialsBlock },
            blogPreview: { label: 'Blog preview', schema: blogPreviewBlock },
            pricing: { label: 'Pricing', schema: pricingBlock },
            imageText: { label: 'Image + text', schema: imageTextBlock },
            logoWall: { label: 'Logo wall', schema: logoWallBlock },
            contactForm: { label: 'Contact form', schema: contactFormBlock },
          },
          { label: 'Sections' }
        ),
      },
    }),
  },
});

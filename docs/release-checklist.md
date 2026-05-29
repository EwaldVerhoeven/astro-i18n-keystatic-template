# Release checklist

Doorloop voor elke versietag (`v0.x.0` / `v0.x.y`).

## Geautomatiseerd (CI moet groen zijn)

- [ ] `shellcheck` job groen (setup.sh + scripts/)
- [ ] `lint` job groen (ESLint + Prettier `--check`)
- [ ] `baseline-build` groen (template AS-IS bouwt)
- [ ] Alle 8 cells van de `setup-matrix` groen

## Handmatig

- [ ] Verse clone + interactieve `setup.sh` doorlopen op macOS
- [ ] Verse clone + interactieve `setup.sh` doorlopen op Linux (WSL of VM)
- [ ] Keystatic-admin testen: pagina aanpassen, controleren dat JSON-bestand committed wordt en pagina herrendert
- [ ] Production build → preview, controleer in browser:
  - Alle 11 secties renderen op homepage
  - `view-source`: meta tags + JSON-LD + hreflang aanwezig
  - Language picker werkt
  - Blog list + detail routes werken
  - Contact form heeft `data-netlify="true"`

## Performance + a11y (handmatig per release)

- [ ] Lighthouse op preview-build:
  - Performance ≥ 90
  - Accessibility ≥ 95
  - SEO = 100
- [ ] axe DevTools-run op homepage met alle 11 secties — 0 critical issues

## Documentatie

- [ ] CHANGELOG.md heeft een nieuwe entry voor deze versie
- [ ] CHANGELOG-link onderaan bestand klopt
- [ ] README.md `## Quick start` nog correct?
- [ ] CLAUDE.md "Bekende v1-gaps" actueel?

## Release-aktie

- [ ] `git tag v0.x.y -m "..."`
- [ ] `git push --tags`
- [ ] `gh release create v0.x.y --notes-from-tag` (of via web)
- [ ] (Eénmalig per template) GitHub Template-flag aan in Settings → Template repository

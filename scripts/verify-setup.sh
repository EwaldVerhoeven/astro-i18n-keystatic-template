#!/usr/bin/env bash
# verify-setup.sh — post-setup assertions for CI matrix.
# Runs after setup.sh + npm run build. Exits non-zero on any failure.

set -euo pipefail

fail() { echo "FAIL: $*" >&2; exit 1; }
ok() { echo "ok: $*"; }

USE_KEYSTATIC="y"
USE_BLOG="y"
USE_NETLIFY="y"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --keystatic=*) USE_KEYSTATIC="${1#*=}" ;;
    --blog=*)      USE_BLOG="${1#*=}" ;;
    --netlify=*)   USE_NETLIFY="${1#*=}" ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done

# ----- 1. No placeholders remain in tracked source -----
# Only git-tracked files are checked: build output (dist/, .netlify/) is
# git-ignored and legitimately contains tokens like `__PURE__`, so scanning the
# whole tree would yield false positives.
# grep exits 1 when nothing matches (the good case), which would abort the
# script under `set -e`/`pipefail`; disable both just for the count.
set +e +o pipefail
if git rev-parse --git-dir >/dev/null 2>&1; then
  # Exclude *.sh: shell tooling (this script) legitimately contains the
  # placeholder regex and example tokens; source placeholders never live in .sh.
  remaining=$(git ls-files | grep -vE '\.sh$' | tr '\n' '\0' | xargs -0 grep -lE "__[A-Z][A-Z_]+__" 2>/dev/null | wc -l | tr -d ' ')
else
  remaining=$(grep -rlE "__[A-Z][A-Z_]+__" \
    --include="*.json" --include="*.toml" --include="*.mjs" --include="*.ts" --include="*.md" --include="*.astro" --include="*.txt" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.astro --exclude-dir=.netlify --exclude-dir=.vercel --exclude-dir=.setup-archive \
    . 2>/dev/null | wc -l | tr -d ' ')
fi
set -e -o pipefail
[[ "$remaining" == "0" ]] || fail "Placeholders remain in tracked files (count: $remaining)"
ok "no placeholders remain"

# ----- 2. No IF/ENDIF markers in README/CLAUDE.md -----
for f in README.md CLAUDE.md; do
  if grep -q -E '<!-- (IF|ENDIF):' "$f"; then
    fail "$f contains unprocessed IF/ENDIF markers"
  fi
done
ok "no IF/ENDIF markers in docs"

# ----- 3. Toggle-state checks -----
if [[ "$USE_KEYSTATIC" == "n" ]]; then
  [[ ! -f keystatic.config.ts ]] || fail "keystatic.config.ts present but Keystatic=n"
  ! grep -q "@keystatic" package.json || fail "@keystatic deps present but Keystatic=n"
  ok "Keystatic correctly absent"
else
  [[ -f keystatic.config.ts ]] || fail "keystatic.config.ts missing but Keystatic=y"
  ok "Keystatic correctly present"
fi

if [[ "$USE_BLOG" == "n" ]]; then
  [[ ! -d src/content/blog ]] || fail "src/content/blog present but Blog=n"
  [[ ! -f src/components/sections/BlogPreview.astro ]] || fail "BlogPreview present but Blog=n"
  ok "Blog correctly absent"
else
  [[ -d src/content/blog ]] || fail "src/content/blog missing but Blog=y"
  ok "Blog correctly present"
fi

if [[ "$USE_NETLIFY" == "n" ]]; then
  [[ ! -f netlify.toml ]] || fail "netlify.toml present but Netlify=n"
  ! grep -q "@astrojs/netlify" package.json || fail "@astrojs/netlify dep present but Netlify=n"
  ok "Netlify correctly absent"
else
  [[ -f netlify.toml ]] || fail "netlify.toml missing but Netlify=y"
  ok "Netlify correctly present"
fi

# ----- 4. Build output exists -----
[[ -d dist ]] || fail "dist/ not created — did 'npm run build' run?"
[[ $(find dist -name "*.html" | wc -l | tr -d ' ') -gt 0 ]] || fail "no HTML files in dist/"
ok "dist/ contains HTML output"

# ----- 5. Setup self-archived -----
[[ ! -f setup.sh ]] || fail "setup.sh still in root (should be archived)"
[[ -f .setup-archive/setup.sh ]] || fail ".setup-archive/setup.sh missing"
ok "setup.sh correctly archived"

echo
echo "✓ All assertions passed for toggle state: keystatic=$USE_KEYSTATIC blog=$USE_BLOG netlify=$USE_NETLIFY"

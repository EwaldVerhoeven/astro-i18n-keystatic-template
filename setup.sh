#!/usr/bin/env bash
# setup.sh — interactive scaffolding for astro-i18n-keystatic-template
# Run once after cloning the template. Idempotency is not supported; the script
# detects an already-initialized state and refuses to run twice.

set -euo pipefail

trap 'echo "Error on line $LINENO (last command: $BASH_COMMAND)" >&2' ERR

# ---------- helpers ----------

err() { echo "Error: $*" >&2; exit 1; }
info() { echo "→ $*"; }

# sed in-place compat: BSD (macOS) vs GNU (Linux)
sed_inplace() {
  if sed --version >/dev/null 2>&1; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

# Escape a value for safe use in sed RHS (handles /, &, \)
sed_escape_rhs() {
  printf '%s' "$1" | sed -e 's/[\/&]/\\&/g'
}

# ---------- pre-flight ----------

preflight() {
  local tool
  for tool in node npm git jq awk find sed; do
    command -v "$tool" >/dev/null || err "$tool is required. Please install it."
  done

  local node_major
  node_major=$(node -v | sed 's/v\([0-9]*\).*/\1/')
  if [[ "$node_major" -lt 22 ]]; then
    err "Node 22.12+ required by Astro (found: $(node -v))"
  fi

  # Detect already-initialized state by absence of __PROJECT_NAME__
  if ! grep -rq "__PROJECT_NAME__" \
       --include="*.json" --include="*.toml" --include="*.mjs" \
       --include="*.ts" --include="*.md" --include="*.astro" \
       . 2>/dev/null; then
    err "This template appears to be already initialized (no __PROJECT_NAME__ placeholders found). Refusing to run."
  fi
}

# ---------- input state ----------

INTERACTIVE=1
PROJECT_NAME=""
PROJECT_SLUG=""
SITE_URL=""
AUTHOR_NAME=""
AUTHOR_EMAIL=""
DEFAULT_LANG="nl"
EXTRA_LANGS="en"
USE_KEYSTATIC="y"
KEYSTATIC_PROJECT=""
USE_BLOG="y"
USE_NETLIFY="y"
ALT_ADAPTER=""
ORG_NAME=""
GEN_ORG_LD="n"
GSV_TOKEN=""
DO_NPM_INSTALL="y"

usage() {
  cat <<EOF
Usage: ./setup.sh [options]

Interactive mode (default): prompts for each value.

Non-interactive mode (--non-interactive): pass all required values via flags.

Flags:
  --non-interactive            Skip prompts; require values via flags below
  --name=<str>                 Project display name (required)
  --slug=<str>                 Project slug, kebab-case (required)
  --site-url=<url>             Production URL, must start with https:// (required)
  --author-name=<str>          Author name (default: from git config)
  --author-email=<email>       Author email (default: from git config)
  --default-lang=<2-letter>    Default language (default: nl)
  --langs=<comma>              Additional languages, e.g. en or empty (default: en)
  --keystatic=y|n              Enable Keystatic CMS (default: y)
  --keystatic-project=<t/p>    Keystatic Cloud project, team/project format (required if keystatic=y)
  --blog=y|n                   Enable blog (default: y)
  --netlify=y|n                Enable Netlify (default: y)
  --adapter=node-standalone|vercel  Alternative SSR adapter when keystatic=y + netlify=n
  --org-name=<str>             Organization name for footer / JSON-LD
  --gsv=<token>                Google Site Verification token (optional)
  --no-install                 Skip 'npm install' at the end
  -h, --help                   Show this help and exit
EOF
}

# ---------- argument parsing ----------

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --non-interactive) INTERACTIVE=0 ;;
      --name=*)              PROJECT_NAME="${1#*=}" ;;
      --slug=*)              PROJECT_SLUG="${1#*=}" ;;
      --site-url=*)          SITE_URL="${1#*=}" ;;
      --author-name=*)       AUTHOR_NAME="${1#*=}" ;;
      --author-email=*)      AUTHOR_EMAIL="${1#*=}" ;;
      --default-lang=*)      DEFAULT_LANG="${1#*=}" ;;
      --langs=*)             EXTRA_LANGS="${1#*=}" ;;
      --keystatic=*)         USE_KEYSTATIC="${1#*=}" ;;
      --keystatic-project=*) KEYSTATIC_PROJECT="${1#*=}" ;;
      --blog=*)              USE_BLOG="${1#*=}" ;;
      --netlify=*)           USE_NETLIFY="${1#*=}" ;;
      --adapter=*)           ALT_ADAPTER="${1#*=}" ;;
      --org-name=*)          ORG_NAME="${1#*=}" ;;
      --gsv=*)               GSV_TOKEN="${1#*=}" ;;
      --no-install)          DO_NPM_INSTALL="n" ;;
      -h|--help)             usage; exit 0 ;;
      *) err "Unknown argument: $1 (use --help for usage)" ;;
    esac
    shift
  done
}

validate_non_interactive() {
  [[ -n "$PROJECT_NAME" ]] || err "--name is required in non-interactive mode"
  [[ -n "$PROJECT_SLUG" ]] || err "--slug is required in non-interactive mode"
  [[ -n "$SITE_URL" ]] || err "--site-url is required in non-interactive mode"
  [[ "$PROJECT_SLUG" =~ ^[a-z0-9-]+$ ]] || err "--slug must match ^[a-z0-9-]+\$"
  [[ "$SITE_URL" =~ ^https:// ]] || err "--site-url must start with https://"
  if [[ "$USE_KEYSTATIC" == "y" ]]; then
    [[ -n "$KEYSTATIC_PROJECT" ]] || err "--keystatic-project required when --keystatic=y"
    [[ "$KEYSTATIC_PROJECT" =~ ^[^/]+/[^/]+$ ]] || err "--keystatic-project must be team/project format"
  fi
  if [[ "$USE_KEYSTATIC" == "y" && "$USE_NETLIFY" == "n" ]]; then
    [[ -n "$ALT_ADAPTER" ]] || err "When Keystatic is on and Netlify is off, --adapter is required (node-standalone or vercel)"
  fi
  # Default ORG_NAME to project name when not supplied.
  [[ -n "$ORG_NAME" ]] || ORG_NAME="$PROJECT_NAME"
}

# ---------- interactive prompts ----------

prompt() {
  local prompt_text="$1"
  local default="${2:-}"
  local result
  if [[ -n "$default" ]]; then
    read -r -p "$prompt_text [$default]: " result
    result="${result:-$default}"
  else
    read -r -p "$prompt_text: " result
  fi
  echo "$result"
}

prompt_required() {
  local prompt_text="$1"
  local validator="${2:-}"  # regex; empty = no validation
  local result
  while true; do
    read -r -p "$prompt_text: " result
    if [[ -z "$result" ]]; then
      echo "  (required)" >&2; continue
    fi
    if [[ -n "$validator" && ! "$result" =~ $validator ]]; then
      echo "  (invalid format)" >&2; continue
    fi
    echo "$result"
    return
  done
}

prompt_yn() {
  local prompt_text="$1"
  local default="${2:-y}"
  local result
  read -r -p "$prompt_text [$default]: " result
  result="${result:-$default}"
  case "$result" in y|Y|yes) echo "y" ;; *) echo "n" ;; esac
}

collect_inputs() {
  echo
  echo "=== astro-i18n-keystatic-template — setup ==="
  echo

  PROJECT_NAME=$(prompt_required "Project display name (e.g. 'Acme Co.')")
  PROJECT_SLUG=$(prompt_required "Project slug (kebab-case)" '^[a-z0-9-]+$')
  SITE_URL=$(prompt_required "Site URL (production, https://...)" '^https://')

  local git_name git_email
  git_name=$(git config --global user.name 2>/dev/null || echo "")
  git_email=$(git config --global user.email 2>/dev/null || echo "")
  AUTHOR_NAME=$(prompt "Author name" "$git_name")
  AUTHOR_EMAIL=$(prompt "Author email" "$git_email")

  DEFAULT_LANG=$(prompt "Default language (2-letter code)" "nl")
  EXTRA_LANGS=$(prompt "Additional languages (comma-separated, blank for monolingual)" "en")

  USE_KEYSTATIC=$(prompt_yn "Use Keystatic CMS?" "y")
  if [[ "$USE_KEYSTATIC" == "y" ]]; then
    KEYSTATIC_PROJECT=$(prompt_required "Keystatic Cloud project (team/project)" '^[^/]+/[^/]+$')
  fi

  USE_BLOG=$(prompt_yn "Include blog?" "y")
  USE_NETLIFY=$(prompt_yn "Deploy to Netlify?" "y")

  if [[ "$USE_KEYSTATIC" == "y" && "$USE_NETLIFY" == "n" ]]; then
    echo "  → Keystatic admin requires SSR. Choose an alternative adapter:"
    echo "    1) node-standalone   2) vercel"
    local choice
    read -r -p "  Choice [1]: " choice
    case "${choice:-1}" in
      1) ALT_ADAPTER="node-standalone" ;;
      2) ALT_ADAPTER="vercel" ;;
      *) err "Invalid choice" ;;
    esac
  fi

  GEN_ORG_LD=$(prompt_yn "Generate Organization JSON-LD?" "n")
  if [[ "$GEN_ORG_LD" == "y" ]]; then
    ORG_NAME=$(prompt_required "Organization name")
  else
    ORG_NAME="$PROJECT_NAME"
  fi

  GSV_TOKEN=$(prompt "Google Site Verification token (optional, blank to skip)" "")

  echo
  echo "=== Summary ==="
  echo "  Project:        $PROJECT_NAME ($PROJECT_SLUG)"
  echo "  URL:            $SITE_URL"
  echo "  Author:         $AUTHOR_NAME <$AUTHOR_EMAIL>"
  echo "  Languages:      $DEFAULT_LANG${EXTRA_LANGS:+,$EXTRA_LANGS}"
  echo "  Keystatic:      $USE_KEYSTATIC${KEYSTATIC_PROJECT:+ ($KEYSTATIC_PROJECT)}"
  echo "  Blog:           $USE_BLOG"
  echo "  Netlify:        $USE_NETLIFY${ALT_ADAPTER:+ (alt adapter: $ALT_ADAPTER)}"
  echo "  Organization:   $ORG_NAME"
  echo "  GSV token:      ${GSV_TOKEN:-(none)}"
  echo

  local confirm
  read -r -p "Proceed? [y/N]: " confirm
  [[ "$confirm" =~ ^[yY]$ ]] || err "Cancelled."
}

# ---------- placeholder replacement ----------

# Replaces __KEY__ with given value across all tracked files.
replace_placeholder() {
  local key="$1"
  local value="$2"
  local escaped
  escaped=$(sed_escape_rhs "$value")

  find . -type f \
    \( -name "*.json" -o -name "*.toml" -o -name "*.mjs" -o -name "*.cjs" \
       -o -name "*.ts" -o -name "*.tsx" -o -name "*.astro" \
       -o -name "*.md" -o -name "*.css" -o -name "*.html" -o -name "*.txt" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./dist/*" \
    -not -path "./.astro/*" \
    -not -path "./.setup-archive/*" \
    -print0 | while IFS= read -r -d '' file; do
      if grep -q "__${key}__" "$file" 2>/dev/null; then
        sed_inplace "s/__${key}__/${escaped}/g" "$file"
      fi
    done
}

apply_placeholders() {
  info "Replacing placeholders..."
  replace_placeholder "PROJECT_NAME" "$PROJECT_NAME"
  replace_placeholder "PROJECT_SLUG" "$PROJECT_SLUG"
  replace_placeholder "project-slug" "$PROJECT_SLUG"   # lowercase variant for package.json name
  replace_placeholder "SITE_URL" "$SITE_URL"
  replace_placeholder "AUTHOR_NAME" "$AUTHOR_NAME"
  replace_placeholder "AUTHOR_EMAIL" "$AUTHOR_EMAIL"
  replace_placeholder "DEFAULT_LANG" "$DEFAULT_LANG"
  replace_placeholder "KEYSTATIC_PROJECT" "$KEYSTATIC_PROJECT"
  replace_placeholder "ORG_NAME" "$ORG_NAME"
  replace_placeholder "GSV_TOKEN" "$GSV_TOKEN"
  info "Placeholders replaced."
}

# ---------- toggle: Keystatic ----------

disable_keystatic() {
  info "Removing Keystatic..."

  rm -f keystatic.config.ts
  rm -rf src/pages/keystatic
  rm -rf src/pages/api/keystatic

  # package.json — strip @keystatic/* deps
  jq 'del(.dependencies["@keystatic/core"], .dependencies["@keystatic/astro"])' \
    package.json > package.json.tmp && mv package.json.tmp package.json

  # astro.config.mjs — remove import and usage
  sed_inplace "/^import keystatic from '@keystatic\/astro';\$/d" astro.config.mjs
  sed_inplace 's/keystatic(),//' astro.config.mjs

  info "Keystatic removed."
}

# ---------- toggle: Blog ----------

disable_blog() {
  info "Removing blog..."

  rm -rf src/content/blog
  rm -rf "src/pages/[lang]/blog"
  rm -f src/components/sections/BlogPreview.astro
  rm -f src/lib/sections/blogPreview.ts

  # Remove BlogPreview from registry.ts (import + objectliteral entry)
  sed_inplace '/^import BlogPreview /d' src/lib/sections/registry.ts
  sed_inplace '/^  blogPreview:/d' src/lib/sections/registry.ts

  # Remove blog collection from content.config.ts
  if [[ -f src/content.config.ts ]]; then
    awk '
      BEGIN { in_blog = 0 }
      /^const blog = defineCollection/ { in_blog = 1; next }
      in_blog && /^\}\);$/ { in_blog = 0; next }
      in_blog { next }
      /^export const collections = / { sub(/, blog/, "") }
      /collections = \{/ { sub(/blog, /, ""); sub(/, blog/, "") }
      /^  blog,/ { next }
      { print }
    ' src/content.config.ts > src/content.config.ts.tmp && \
      mv src/content.config.ts.tmp src/content.config.ts
  fi

  # Remove blogPreview block from keystatic.config.ts (only if present)
  if [[ -f keystatic.config.ts ]]; then
    sed_inplace '/^const blogPreviewBlock = fields/,/^});$/d' keystatic.config.ts
    sed_inplace '/blogPreview:.*blogPreviewBlock/d' keystatic.config.ts
  fi

  # Remove blog link from Nav
  sed_inplace "/{lang}\/blog/d" src/components/layout/Nav.astro

  # Remove blogPreview fixture from seed pages
  local page
  for page in src/content/pages/nl/home.json src/content/pages/en/home.json; do
    if [[ -f "$page" ]]; then
      jq 'if .sections then .sections |= map(select(._type != "blogPreview")) else . end' \
         "$page" > "$page.tmp" && mv "$page.tmp" "$page"
    fi
  done

  info "Blog removed."
}

# ---------- toggle: Netlify ----------

disable_netlify() {
  info "Removing Netlify..."

  rm -f netlify.toml

  jq 'del(.dependencies["@astrojs/netlify"])' \
    package.json > package.json.tmp && mv package.json.tmp package.json

  sed_inplace "/^import netlify from '@astrojs\/netlify';\$/d" astro.config.mjs

  if [[ "$USE_KEYSTATIC" == "y" ]]; then
    # Keystatic admin needs SSR — swap in an alternative adapter.
    case "$ALT_ADAPTER" in
      node-standalone)
        npm install @astrojs/node --save 2>/dev/null || true
        awk '
          /^import / && !inserted && /from .astro\/config/ { print; print "import node from '\''@astrojs/node'\'';"; inserted=1; next }
          /adapter: netlify\(\),?/ { sub(/adapter: netlify\(\),?/, "adapter: node({ mode: '\''standalone'\'' }),"); print; next }
          { print }
        ' astro.config.mjs > astro.config.mjs.tmp && mv astro.config.mjs.tmp astro.config.mjs
        ;;
      vercel)
        npm install @astrojs/vercel --save 2>/dev/null || true
        awk '
          /^import / && !inserted && /from .astro\/config/ { print; print "import vercel from '\''@astrojs/vercel'\'';"; inserted=1; next }
          /adapter: netlify\(\),?/ { sub(/adapter: netlify\(\),?/, "adapter: vercel(),"); print; next }
          { print }
        ' astro.config.mjs > astro.config.mjs.tmp && mv astro.config.mjs.tmp astro.config.mjs
        ;;
      *)
        err "Internal error: ALT_ADAPTER not set despite Keystatic on + Netlify off"
        ;;
    esac
  else
    # No Keystatic — may be fully static.
    sed_inplace "s/output: 'server',/output: 'static',/" astro.config.mjs
    # Plain BRE pattern: \? is unsupported on BSD sed (macOS). The parens are
    # literal in BRE, so this matches `adapter: netlify(),` on both sed flavours.
    sed_inplace '/adapter: netlify()/d' astro.config.mjs
  fi

  info "Netlify removed."
}

# ---------- IF/ENDIF processing ----------

# Strips IF:FEATURE / ENDIF:FEATURE blocks from a file based on enabled features.
# Supports negation via !FEATURE (block kept ONLY when FEATURE is off).
process_conditionals() {
  local file="$1"
  shift
  local enabled=""
  local f
  for f in "$@"; do
    enabled+=":${f}:"
  done

  awk -v enabled="$enabled" '
    function block_active(feat,    neg, fname, key) {
      neg = 0
      if (substr(feat, 1, 1) == "!") { neg = 1; fname = substr(feat, 2) }
      else { fname = feat }
      key = ":" fname ":"
      if (neg) return (index(enabled, key) == 0) ? 1 : 0
      else     return (index(enabled, key) != 0) ? 1 : 0
    }
    BEGIN { skip = 0 }
    /<!-- IF:[!A-Z]+ -->/ {
      match($0, /IF:[!A-Z]+/)
      current_feat = substr($0, RSTART+3, RLENGTH-3)
      skip = (block_active(current_feat) == 0)
      next
    }
    /<!-- ENDIF:[!A-Z]+ -->/ {
      skip = 0
      next
    }
    !skip { print }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

apply_conditionals() {
  info "Processing README and CLAUDE.md conditionals..."
  local features=()
  [[ "$USE_KEYSTATIC" == "y" ]] && features+=("KEYSTATIC")
  [[ "$USE_BLOG" == "y" ]] && features+=("BLOG")
  [[ "$USE_NETLIFY" == "y" ]] && features+=("NETLIFY")

  local f
  for f in README.md CLAUDE.md; do
    # ${features[@]+...} keeps this safe under `set -u` when no features are
    # enabled (an empty array) on bash 3.2 (macOS default).
    [[ -f "$f" ]] && process_conditionals "$f" ${features[@]+"${features[@]}"}
  done
  info "Conditionals processed."
}

# ---------- finalize ----------

archive_setup() {
  info "Archiving setup.sh..."
  mkdir -p .setup-archive
  mv "$0" .setup-archive/setup.sh 2>/dev/null || cp "$0" .setup-archive/setup.sh
  info "setup.sh moved to .setup-archive/ (kept for reference, git-ignored)."
}

reset_git() {
  info "Resetting git history..."
  rm -rf .git
  git init -q
  git config user.name "$AUTHOR_NAME"
  git config user.email "$AUTHOR_EMAIL"
  git add -A
  git commit -q -m "Initial commit from astro-i18n-keystatic-template"
  info "Git initialized with single 'Initial commit' on default branch."
}

run_npm_install() {
  if [[ "$DO_NPM_INSTALL" == "y" ]]; then
    info "Running npm install..."
    npm install --silent
  else
    info "Skipping npm install (--no-install passed)."
  fi
}

print_next_steps() {
  cat <<EOF

✓ Setup complete.

Next steps:
  1. Review the new project structure.
  2. Run:  npm run dev
  3. Open: http://localhost:4321/${DEFAULT_LANG}/
EOF

  if [[ "$USE_KEYSTATIC" == "y" ]]; then
    cat <<EOF
  4. Keystatic admin: http://localhost:4321/keystatic
     (Cloud project: $KEYSTATIC_PROJECT — allow local development in your project settings)
EOF
  fi

  cat <<EOF
  5. Create a GitHub repo and push:
       git remote add origin git@github.com:USER/REPO.git
       git branch -M main
       git push -u origin main
EOF

  if [[ "$USE_NETLIFY" == "y" ]]; then
    cat <<EOF

⚠ Reminder: pushing to 'main' triggers a Netlify deploy and consumes credits.
   Build locally first, push deliberately.
EOF
  fi
}

# ---------- main ----------

main() {
  preflight
  parse_args "$@"
  if [[ $INTERACTIVE -eq 1 ]]; then
    collect_inputs
  else
    validate_non_interactive
  fi

  apply_placeholders
  [[ "$USE_KEYSTATIC" == "n" ]] && disable_keystatic
  [[ "$USE_BLOG" == "n" ]] && disable_blog
  [[ "$USE_NETLIFY" == "n" ]] && disable_netlify
  apply_conditionals

  # Archive before resetting git so the initial commit is clean.
  archive_setup
  reset_git
  run_npm_install
  print_next_steps
}

main "$@"

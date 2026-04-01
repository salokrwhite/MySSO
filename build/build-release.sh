#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
RELEASE_DIR="$ROOT_DIR/release"
BACKEND_OUT="$RELEASE_DIR/backend"
FRONTEND_OUT="$RELEASE_DIR/frontend"
ASSET_CDN_OUT="$RELEASE_DIR/cdn-assets"
LOCALE_CDN_OUT="$RELEASE_DIR/cdn-locale-assets"
PACKAGE_ROOT="$RELEASE_DIR/package"
LOCALE_MAP_OUTPUT="$FRONTEND_DIR/src/i18n/localeRemoteMap.generated.ts"
DEVELOPER_LOCALE_MAP_OUTPUT="$FRONTEND_DIR/src/pages/developer/developerLocaleRemoteMap.generated.ts"
LOCALE_MAP_SCRIPT="$ROOT_DIR/build/generate-locale-remote-map.mjs"

APP_NAME="${APP_NAME:-mysso-server}"
TARGET_OS="${TARGET_OS:-linux}"
TARGET_ARCH="${TARGET_ARCH:-amd64}"
CGO_ENABLED="${CGO_ENABLED:-0}"
RUN_TESTS="${RUN_TESTS:-0}"
VERSION="${VERSION:-$(date -u +"%Y%m%d%H%M%S")}"
ARCHIVE_NAME="${ARCHIVE_NAME:-mysso-${TARGET_OS}-${TARGET_ARCH}-${VERSION}.tar.gz}"
ASSET_CDN_BASE="${ASSET_CDN_BASE:-}"
LOCALE_CDN_BASE="${LOCALE_CDN_BASE:-}"
VITE_API_ORIGIN="${VITE_API_ORIGIN:-}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

echo "==> Checking build dependencies"
require_cmd go
require_cmd npm
require_cmd tar
require_cmd node

echo "==> Preparing release directory"
rm -rf "$RELEASE_DIR"
mkdir -p "$BACKEND_OUT" "$FRONTEND_OUT" "$PACKAGE_ROOT"

echo "==> Building backend binary for ${TARGET_OS}/${TARGET_ARCH}"
(
  cd "$BACKEND_DIR"
  if [ "$RUN_TESTS" = "1" ]; then
    echo "==> Running backend tests"
    go test ./...
  else
    echo "==> Skipping backend tests (set RUN_TESTS=1 to enable)"
  fi
  GOOS="$TARGET_OS" GOARCH="$TARGET_ARCH" CGO_ENABLED="$CGO_ENABLED" \
    go build -trimpath -ldflags="-s -w" \
    -o "$BACKEND_OUT/$APP_NAME" ./cmd/server
)

echo "==> Copying backend runtime files"
cat > "$BACKEND_OUT/.env" <<'EOF'
INSTALL_ENABLED=
INSTALL_ALLOW_REMOTE=
INSTALL_ALLOWED_DB_HOSTS=127.0.0.1,localhost,::1

HTTP_ADDR=:
PUBLIC_BASE_URL=
FRONTEND_BASE_URL=
EOF
cp -R "$BACKEND_DIR/migrations" "$BACKEND_OUT/migrations"

echo "==> Installing frontend dependencies"
(
  cd "$FRONTEND_DIR"
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi

  if [ -n "$VITE_API_ORIGIN" ]; then
    echo "==> Frontend API origin override: $VITE_API_ORIGIN"
  else
    echo "==> Frontend API origin override: runtime auto-detect"
  fi

  if [ -n "$ASSET_CDN_BASE" ]; then
    echo "==> Frontend asset CDN base: $ASSET_CDN_BASE"
  else
    echo "==> Frontend asset CDN base: local bundled assets"
  fi

  if [ -z "$LOCALE_CDN_BASE" ]; then
    echo "==> Frontend locale mode: local bundled locales"
    ASSET_CDN_BASE="$ASSET_CDN_BASE" VITE_API_ORIGIN="$VITE_API_ORIGIN" npm run build
  else
    echo "==> Frontend build mode: remote locales"
    mkdir -p "$LOCALE_CDN_OUT/assets"

    echo "==> Frontend build pass 1/2: local locale chunks"
    ASSET_CDN_BASE="$ASSET_CDN_BASE" VITE_API_ORIGIN="$VITE_API_ORIGIN" npm run build

    echo "==> Extracting locale CDN assets and generating remote locale map"
    node "$LOCALE_MAP_SCRIPT" \
      --dist-assets="$FRONTEND_DIR/dist/assets" \
      --output="$LOCALE_MAP_OUTPUT" \
      --release-assets="$LOCALE_CDN_OUT/assets" \
      --cdn-base="$LOCALE_CDN_BASE"

    node "$LOCALE_MAP_SCRIPT" \
      --dist-assets="$FRONTEND_DIR/dist/assets" \
      --output="$DEVELOPER_LOCALE_MAP_OUTPUT" \
      --release-assets="$LOCALE_CDN_OUT/assets" \
      --cdn-base="$LOCALE_CDN_BASE" \
      --file-pattern='^languages-developer-(.+?)\.[^.]+\.chunk\.js$' \
      --export-name=developerRemoteLocaleMap

    echo "==> Frontend build pass 2/2: release bundle with CDN locale map"
    ASSET_CDN_BASE="$ASSET_CDN_BASE" VITE_API_ORIGIN="$VITE_API_ORIGIN" VITE_REMOTE_LOCALE=1 npm run build
  fi

  if [ -n "$ASSET_CDN_BASE" ]; then
    mkdir -p "$ASSET_CDN_OUT/assets"
    find dist/assets -maxdepth 1 -type f ! -name 'languages-*.chunk.js' -exec cp {} "$ASSET_CDN_OUT/assets/" \;
  fi

  cp -R dist/. "$FRONTEND_OUT/"
)

echo "==> Assembling deployment package"
mkdir -p "$PACKAGE_ROOT/backend" "$PACKAGE_ROOT/frontend"
cp -R "$BACKEND_OUT/." "$PACKAGE_ROOT/backend/"
cp -R "$FRONTEND_OUT/." "$PACKAGE_ROOT/frontend/"
if [ -n "$ASSET_CDN_BASE" ] && [ -d "$ASSET_CDN_OUT" ]; then
  mkdir -p "$PACKAGE_ROOT/cdn-assets"
  cp -R "$ASSET_CDN_OUT/." "$PACKAGE_ROOT/cdn-assets/"
fi
if [ -n "$LOCALE_CDN_BASE" ] && [ -d "$LOCALE_CDN_OUT" ]; then
  mkdir -p "$PACKAGE_ROOT/cdn-locale-assets"
  cp -R "$LOCALE_CDN_OUT/." "$PACKAGE_ROOT/cdn-locale-assets/"
fi
cp "$ROOT_DIR/README.md" "$PACKAGE_ROOT/README.md"

tar -czf "$RELEASE_DIR/$ARCHIVE_NAME" -C "$PACKAGE_ROOT" .

echo "==> Build completed"
echo "Backend binary: $BACKEND_OUT/$APP_NAME"
echo "Backend env: $BACKEND_OUT/.env"
echo "Backend migrations: $BACKEND_OUT/migrations"
echo "Frontend assets: $FRONTEND_OUT"
if [ -n "$ASSET_CDN_BASE" ]; then
  echo "Asset CDN files: $ASSET_CDN_OUT"
  echo "Frontend asset CDN base: $ASSET_CDN_BASE"
else
  echo "Frontend asset mode: local"
fi
if [ -n "$LOCALE_CDN_BASE" ]; then
  echo "Locale CDN assets: $LOCALE_CDN_OUT"
  echo "Generated locale map: $LOCALE_MAP_OUTPUT"
  echo "Generated developer locale map: $DEVELOPER_LOCALE_MAP_OUTPUT"
  echo "Locale CDN base: $LOCALE_CDN_BASE"
else
  echo "Locale mode: local"
fi
if [ -n "$VITE_API_ORIGIN" ]; then
  echo "Frontend API origin: $VITE_API_ORIGIN"
else
  echo "Frontend API origin: runtime auto-detect"
fi
echo "Release archive: $RELEASE_DIR/$ARCHIVE_NAME"

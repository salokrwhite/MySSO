# MySSO

[English](README.md) | [简体中文](README.zh-CN.md)

MySSO is an open-source single sign-on platform built around OIDC and OAuth 2.0. It includes:

- a user-facing authentication center
- a developer portal for application onboarding and secret management
- an admin console for governance, review, risk control, and system settings
- a Go backend exposing standard identity and token endpoints

This repository is intended to cover the full path from local development to production deployment.

## Core Features

- Authentication center
  - password login
  - email / SMS OTP login
  - MFA
  - account center with profile, avatar, bindings, passkeys, and consent management

- OIDC / OAuth 2.0
  - authorization endpoint
  - token endpoint
  - userinfo endpoint
  - revocation support
  - OpenID discovery
  - JWKS publishing
  - first-party client support

- Developer portal
  - create and edit OIDC applications
  - configure redirect URIs, logout URIs, scopes, descriptions, and icons
  - track app review status
  - create and reset client secrets
  - manage reusable developer-level user groups and batch-update authorized users
  - bind allowed user groups to apps for allowlist-based access control
  - ban users per app without affecting platform sign-in or other developers' apps
  - developer audit logs and analytics

- Admin console
  - app review workflow
  - user management
  - audit logs
  - gateway policy management
  - site settings, email, SMS, and i18n templates
  - risk control and rate limiting

- Deployment support
  - installation flow with minimal initial `.env`
  - MySQL migrations
- production release packaging
- optional asset CDN mode
- optional remote locale CDN mode

## Repository Structure

```text
backend/   Go backend service
frontend/  React + Vite frontend
build/     release build scripts and locale tooling
release/   generated build output (created by build scripts)
```

## Tech Stack

- Backend: Go
- Frontend: React, Vite, TypeScript, Ant Design
- Database: MySQL
- Protocols: OIDC, OAuth 2.0

## Developer Access Control

The platform supports developer-level user groups, app-level access control, and single-app bans:

- user groups are reusable across multiple apps owned by the same developer
- developers may manage only users who have already authorized at least one of their apps
- apps are open by default; once one or more groups are bound, the app switches into allowlist mode
- app-level bans affect only the target app and do not block platform sign-in or other developers' apps
- group and ban changes affect first-time authorization, repeated authorization, `prompt=none` silent authorization, and consent-based auto-approval
- third-party systems should always use `sub` as the stable unique user identifier, while `display_name` remains display-only

If you enable app access control, make sure your integration handles authorization denial cases such as “current account cannot access this app” or “current account is banned from this app”.

## Quick Start

### 1. Start the backend

```bash
cd backend
go mod tidy
go run ./cmd/server
```

Default backend address:

```text
http://localhost:8080
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend address:

```text
http://localhost:5173
```

## Runtime Configuration

At runtime, backend configuration is effectively resolved in this order:

1. database-backed system settings
2. `backend/.env`
3. code defaults

The most important production configuration items are:

- `DATABASE_URL`
- `PUBLIC_BASE_URL`
- `FRONTEND_BASE_URL`
- `DEVICE_COOKIE_SECRET`
- `OIDC_SIGNING_PRIVATE_KEY_PATH` or `OIDC_SIGNING_PRIVATE_KEY_PEM`

Notes:

- `PUBLIC_BASE_URL` is the public backend / OIDC origin.
- `FRONTEND_BASE_URL` is the public frontend origin.
- `DEVICE_COOKIE_SECRET` should always be explicitly configured in production.
- JWT signing keys must be persisted and must not rely on temporary runtime generation.

## Build and Packaging

Release builds are driven by:

- `build.sh`
- `build/build-release.sh`

### Default release build

```bash
./build.sh
```

This produces:

- `release/backend`
  - backend binary
  - minimal deployment `.env`
  - database migrations

- `release/frontend`
  - production frontend assets

- `release/package`
  - assembled package directory before archiving

- `release/*.tar.gz`
  - final release archive

### Override frontend API origin

```bash
VITE_API_ORIGIN=https://backend-sso.example.com ./build.sh
```

### Asset CDN mode

If the main frontend assets should be served from a CDN:

```bash
ASSET_CDN_BASE=https://cdn.example.com/assets \
VITE_API_ORIGIN=https://backend-sso.example.com \
./build.sh
```

In this mode:

- the built `index.html` will reference JS / CSS under `ASSET_CDN_BASE`
- if `LOCALE_CDN_BASE` is not set, locale chunks still default to the built frontend `assets/` directory
- the files to upload for the asset CDN are written to:

```text
release/cdn-assets/assets/*
```

If `ASSET_CDN_BASE` is not set, the frontend keeps using the built-in local `assets/` directory by default.

### Remote locale CDN mode

If locale chunks should be served from a CDN:

```bash
VITE_API_ORIGIN=https://backend-sso.example.com \
LOCALE_CDN_BASE=https://cdn.example.com/assets \
./build.sh
```

In this mode the build script:

1. builds the frontend once to emit locale chunks
2. copies locale chunks into `release/cdn-locale-assets/assets`
3. generates the remote locale map
4. rebuilds the frontend so locale files load from the CDN base URL

If you use this mode, upload:

```text
release/cdn-locale-assets/assets/*
```

to your CDN, and make sure the public URLs match `LOCALE_CDN_BASE`.

If `LOCALE_CDN_BASE` is not set, locale chunks keep using the built frontend `assets/` directory by default.

### Asset CDN + locale CDN together

You may use both modes at the same time:

```bash
ASSET_CDN_BASE=https://cdn-a.example.com/assets \
LOCALE_CDN_BASE=https://cdn-b.example.com/assets \
VITE_API_ORIGIN=https://backend-sso.example.com \
./build.sh
```

In that case:

- upload `release/cdn-assets/assets/*` to `ASSET_CDN_BASE`
- upload `release/cdn-locale-assets/assets/*` to `LOCALE_CDN_BASE`

### Optional build variables

- `TARGET_OS`
- `TARGET_ARCH`
- `APP_NAME`
- `RUN_TESTS`
- `CGO_ENABLED`
- `VERSION`
- `ASSET_CDN_BASE`
- `LOCALE_CDN_BASE`
- `VITE_API_ORIGIN`

Example:

```bash
ASSET_CDN_BASE=https://cdn-a.example.com/assets \
LOCALE_CDN_BASE=https://cdn-b.example.com/assets \
TARGET_OS=linux \
TARGET_ARCH=amd64 \
RUN_TESTS=1 \
./build.sh
```

## Deployment

### Recommended topology

Recommended production setup:

- one frontend domain
- one backend / OIDC domain
- one optional CDN domain for frontend assets
- one optional CDN domain for locale assets

Recommended practice:

- run the Go backend on localhost or a private interface such as `127.0.0.1:5233`
- expose public traffic through Nginx on `80/443`

### Minimal pre-install backend `.env`

Before first installation, a minimal backend `.env` can look like this:

```env
INSTALL_ENABLED=true
INSTALL_ALLOW_REMOTE=true
INSTALL_ALLOWED_DB_HOSTS=127.0.0.1,localhost,::1

HTTP_ADDR=127.0.0.1:5233
PUBLIC_BASE_URL=https://backend-sso.example.com
FRONTEND_BASE_URL=https://frontend-sso.example.com
OIDC_ISSUER=https://backend-sso.example.com
```

After installation, the system will generate or persist more runtime settings, including database-backed system settings and OIDC key-related configuration.

### Backend Nginx essentials

Your backend proxy must correctly forward:

- `/`
- `/.well-known/openid-configuration`
- `/.well-known/jwks.json`

Do not let a generic `/.well-known/` static rule swallow the OIDC endpoints.

Example:

```nginx
location / {
    proxy_pass http://127.0.0.1:5233;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
}

location = /.well-known/openid-configuration {
    proxy_pass http://127.0.0.1:5233;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
}

location = /.well-known/jwks.json {
    proxy_pass http://127.0.0.1:5233;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_http_version 1.1;
}
```

If you already use `/.well-known/` for ACME challenges, restrict it to:

```nginx
location ^~ /.well-known/acme-challenge/ {
    root /www/wwwroot/java_node_ssl;
}
```

### Frontend Nginx essentials

Because the frontend is a SPA, route fallback to `index.html` is required:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Optional static cache rule:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$ {
    expires 12h;
    access_log off;
}
```

### CDN CORS essentials

If you enable asset CDN or remote locale loading, the corresponding CDN must return CORS headers for `/assets/`.

Example:

```nginx
location ^~ /assets/ {
    add_header Access-Control-Allow-Origin "https://frontend-sso.example.com" always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "*" always;

    expires 12h;
    access_log off;

    if ($request_method = OPTIONS) {
        return 204;
    }

    try_files $uri =404;
}
```

### Deployment checklist

1. prepare backend `.env`
2. start the Go backend and verify health
3. configure backend Nginx
4. build the release package
5. deploy frontend static assets
6. deploy backend binary, `.env`, and migrations
7. if using remote locales, upload `release/cdn-assets/assets`
8. open the frontend and complete installation
9. restart the backend if installation returns `reload_required`
10. verify login, authorization, callback, logout, and locale loading

### Smoke tests

```bash
curl -i http://127.0.0.1:5233/healthz
curl -i http://127.0.0.1:5233/api/install/status
curl -i https://backend-sso.example.com/.well-known/openid-configuration
curl -i https://backend-sso.example.com/.well-known/jwks.json
```

## Common Pitfalls

- Frontend shows `Unexpected token '<'`
  - usually means the frontend received HTML instead of JSON
  - check `VITE_API_ORIGIN`
  - check reverse proxy routing

- Discovery or JWKS returns `404`
  - usually caused by Nginx treating `/.well-known/` as a static directory

- Asset CDN or remote locale loading fails with CORS
  - make sure `/assets/` CORS headers are returned
  - make sure a regex static rule is not overriding the `/assets/` location

- Installation completes but still returns to `/install`
  - restart the backend
  - check `/api/install/status`

## Current Scope

This repository is already runnable and covers the core OIDC + OAuth 2.0 integration loop, but it is still evolving. It is best understood as a complete, usable platform baseline rather than a fully frozen commercial product.

Implemented areas include:

- OIDC authorization code + PKCE core flow
- app review gating
- MFA and consent flows
- admin system settings
- release packaging

![Site Image](./site-image-bule.webp)

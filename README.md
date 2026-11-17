# Shaikh's — fictional static client demo

Demo-only source for `Mohammedkhalandar/shaikhs-food-delivery-demo`. Site URL: https://mohammedkhalandar.github.io/shaikhs-food-delivery-demo/ . Original code and branding are All Rights Reserved; illustrations retain their scoped CC0 dedication and development tools retain their upstream licenses. See LICENSE and THIRD_PARTY_NOTICES.md.

Every dish, price, basket, delivery step and COD reconciliation is fictional. This is a presentation, not an ordering service. No customer accounts, personal-data forms, database, API, payment SDK, external messaging, payouts or real fulfilment exists. State lives in page memory and clears on reload. Preview roles demonstrate the same simulated journey; they are not authenticated accounts. The hosting provider may keep infrastructure access logs.

## Local checks

Node 24; `npm ci`, `npm run build`, `npm run lint`, `npm test`, `npm run test:security`, `npm audit --audit-level=moderate`. For browser checks: `npx playwright install chromium`, then `npm run test:browser`. An optional DEMO_BROWSER_EXECUTABLE can select an already installed compatible isolated Chromium executable. Do not weaken network tests for machine-managed browser extensions.

`npm start` previews http://127.0.0.1:4175/shaikhs-food-delivery-demo/ on loopback only. No database or environment secrets are required.

## Deployment scope

Only `dist` is a website artifact: HTML, CSS, browser JavaScript, original illustration assets and `.nojekyll`. Node preview/build scripts, tests, npm dependencies, workflow files, artwork sources and documentation are not deployed. Relative asset URLs, hash navigation, query-string reloads and repository-prefix mounting avoid root-path assumptions. Deep links outside the one-page walkthrough receive the generic 404 page.

GitHub Pages does not apply a Cloudflare-style `_headers` file. The build embeds CSP and referrer metadata before script/style requests; `connect-src 'none'` and `form-action 'none'` restrict the static demo. HTML cannot enforce `frame-ancestors`, X-Frame-Options or arbitrary HTTP response headers. No claim of those protections is made. HTTPS is a host activation check. If custom response headers or confidentiality are required, stop and reassess hosting rather than claim Pages meets them.

See [licensing](LICENSING.md), [precheck evidence](PRECHECK_REPORT.md) and [the publication checklist](PUBLICATION_CHECKLIST.md). The owner authorized this separate public demonstration. Its history starts clean; no private repository's `.git` directory, operational records or backend is reused. Updates still require checks and the explicit manual deployment workflow.

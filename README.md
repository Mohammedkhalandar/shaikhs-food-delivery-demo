# Shaikh's — fictional static client demo

Demo-only source for `Mohammedkhalandar/shaikhs-food-delivery-demo`. Site URL: https://mohammedkhalandar.github.io/shaikhs-food-delivery-demo/ . Original code and branding are All Rights Reserved; illustrations retain their scoped CC0 dedication and development tools retain their upstream licenses. See LICENSE and THIRD_PARTY_NOTICES.md.

Every dish, price, basket, delivery step and COD reconciliation is fictional. This is a presentation, not an ordering service. No customer accounts, personal-data forms, database, API, payment SDK, external messaging, payouts or real fulfilment exists. State lives in page memory and clears on reload. Preview roles demonstrate the same simulated journey; they are not authenticated accounts. The hosting provider may keep infrastructure access logs.

## For the client

Open the welcome walkthrough, explore three clearly fictional kitchens, search the six illustrative dishes and combine kitchen/category filters. Clear filters to recover from an empty search. Add a dish, adjust its demo quantity in the basket and simulate COD once. Switch Preview role through Restaurant, Rider and Admin to follow the same simulated journey; Reset demo or reload starts over. No actual purchase or delivery is possible. See [CLIENT_HANDOFF.md](CLIENT_HANDOFF.md) for a two-minute review script and safe feedback instructions.

The search field is the only text input: it searches fictional menu content in page memory, is limited to 80 characters, has autocomplete disabled, is not added to the URL and is never stored or sent. Do not enter personal information. The feedback issue tracker opens a separate GitHub website; posting there is the reviewer's explicit action, not a messaging integration in this demo.

## Local checks

Node 24; `npm ci`, `npm run build`, `npm run lint`, `npm test`, `npm run test:security`, `npm audit --audit-level=moderate`. For browser checks: `npx playwright install chromium`, then `npm run test:browser`. An optional DEMO_BROWSER_EXECUTABLE can select an already installed compatible isolated Chromium executable. Do not weaken network tests for machine-managed browser extensions.

Browser checks cover 360/390/430/768/1440 widths, combined filters, safe empty/search states, basket limits, keyboard focus, all simulated roles, reduced-motion layouts, images and accessibility. Set DEMO_TEST_URL to the exact public site URL to run those checks against the deployed version; other live hosts are refused. `npm run test:performance` measures the actual public site in three fresh/cache-disabled Chromium contexts per mobile/desktop profile with documented CDP throttling. It records lab LCP/CLS/transfer bytes under ignored test artifacts, not physical-device, field p75 or INP acceptance.

`npm start` previews http://127.0.0.1:4175/shaikhs-food-delivery-demo/ on loopback only. No database or environment secrets are required.

## Deployment scope

Only `dist` is a website artifact: HTML, CSS, browser JavaScript, original illustration assets and `.nojekyll`. Node preview/build scripts, tests, npm dependencies, workflow files, artwork sources and documentation are not deployed. Relative asset URLs, hash navigation, query-string reloads and repository-prefix mounting avoid root-path assumptions. Deep links outside the one-page walkthrough receive the generic 404 page.

GitHub Pages does not apply a Cloudflare-style `_headers` file. The build embeds CSP and referrer metadata before script/style requests; `connect-src 'none'` and `form-action 'none'` restrict the static demo. HTML cannot enforce `frame-ancestors`, X-Frame-Options or arbitrary HTTP response headers. No claim of those protections is made. HTTPS is a host activation check. If custom response headers or confidentiality are required, stop and reassess hosting rather than claim Pages meets them.

See [licensing](LICENSING.md), [precheck evidence](PRECHECK_REPORT.md) and [the publication checklist](PUBLICATION_CHECKLIST.md). The owner authorized this separate public demonstration. Its history starts clean; no private repository's `.git` directory, operational records or backend is reused. Updates still require checks and the explicit manual deployment workflow.

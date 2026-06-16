# Security Findings — Consolidated Bug Report

Aggregated from local engagement notes across 8 assessed targets. Engagements dated 2026-05.

| Target | Findings | Highest Severity |
|---|---|---|
| Zomato (eternal) | 5 | High |
| inDrive | 6 | Medium |
| Desk365 | 6 | High |
| Ghar Soaps | 11 | High |
| mCaffeine | 12 | High |
| CAMU (mycamu) | 6 | Medium |
| TCE (tce.edu) | 5 | High |
| TNSTC OTRSOnline | 15 | Critical |

---

## Zomato — www.zomato.com / enterprise.zomato.com

### Z-01 — Exposed Sentry DSNs in Production JS Bundle (High, CWE-312, CVSS 7.5)
Two active Sentry DSNs hardcoded in `zwstatic.zomato.com/main-*.js` pointing at self-hosted `sentry.zomato.com` (projects 52, 158). Both validated by submitting test events (HTTP 200 + event IDs). Allows unauthenticated event injection, data pollution, alerting DoS.

### Z-02 — Hardcoded API Key / OAuth Credentials in enterprise bundle (High, CWE-798, CVSS 8.2)
`enterprise.zomato.com/static/js/main.*.js` leaks `REACT_APP_ZOMATO_API_KEY`, `AUTH_CLIENT_ID`, and a trivially weak `GIFT_CARD_HASH_KEY=1234123412341234`. Enables API abuse, possible gift-card token forgery, OAuth flow abuse.

### Z-03 — Public Source Map Exposure (Medium, CWE-540, CVSS 5.3)
`main.*.js.map` (6.1 MB, 1021 files / 299 app files) publicly served — full source incl. payment & auth logic reconstructable. Amplifies Z-02.

### Z-04 — S3 Bucket Public Listing (Medium, CWE-732, CVSS 5.3)
`zweb.zomato.com` S3 bucket (via CloudFront `zwstatic`) allows unauthenticated `list-type=2` enumeration of 1000+ objects incl. historical bundles back to 2021 — enables historical credential hunting.

### Z-05 — Internal Hostname / API Endpoint Enumeration (Low/Info, CWE-200, CVSS 3.7)
JS bundles leak `localhost:3001`, `api.zomato.com`, 143 internal webroutes, and undiscovered subdomains (accounts, sentry, enterprise, api).

---

## inDrive — delivery-webview.indrive.com / teammate.indriver.io / indrive.mediator.cloud

### ID-01 — Exposed Sentry DSN w/ valid write key (Medium, CWE-312)
DSN `d8303b4f...@sentry.buglytics.com/52` exposed in webpack chunk and SSR `<meta name="baggage">`. Validated by event submission. `sentry-sample_rate=1` = 100% capture.

### ID-02 — Internal HR/Employee GraphQL API exposed (Medium)
`teammate.indriver.io` serves internal HR SPA publicly; `/query` GraphQL + `/api/*` reachable (403 "Can not parse claims" leaks JWT impl). 30+ operations exposed handling salary/bonus/IBAN data. nginx 1.20.2 (EOL).

### ID-03 — Unauthenticated access to internal Awards platform (Low-Medium)
`indrive.mediator.cloud` (PHP 8.4.11) auto-issues `mediator_auth` cookie with `SameSite=None` — CSRF prerequisite. Public to internet.

### ID-04 — Internal Courier API endpoints exposed unauthenticated (Low)
`/api/courier/*` and `/api/web-vitals` reachable; inconsistent 401/405 responses leak endpoint existence. `web-vitals` is a live data receiver.

### ID-05 — Reflected XSS via unescaped og:url meta tag (Medium, CWE-79)
`indrive.mediator.cloud/?q=test"/><script>...` breaks out of `content="..."` attribute; no CSP. All query params reflected via raw REQUEST_URI without `htmlspecialchars()`.

### ID-06 — Missing CSRF protection on state-change endpoints (Medium, CWE-352)
No CSRF token on `/api/give`, `/api/award`, `/api/profile`, `/api/user`; `SameSite=None` auth cookie. Cross-origin POST returns 200. Award nominations forgeable.

---

## Desk365 — desk365.io and subdomains

### D-01 — WordPress REST API unauth user enumeration (Medium, CWE-200, CVSS 5.3)
`/wp-json/wp/v2/users` on www + staging exposes 11+ employee login slugs & names; `?author=N` reveals more. Feeds password spraying / spear-phishing.

### D-02 — Missing security headers across all surfaces (Medium, CWE-693, CVSS 6.1)
No CSP/XFO/HSTS/X-Content-Type/Referrer/Permissions on any property. Clickjacking on support login; XSS amplification (JWT in localStorage).

### D-03 — DMARC p=none enables email spoofing (High, CWE-290, CVSS 7.5)
`_dmarc.desk365.io` = `p=none;pct=25` — zero enforcement, 75% unsampled, selector2 DKIM absent. Spoof `support@desk365.io` for BEC against customers.

### D-04 — Wildcard CORS on production backend (KaniPSA) (High, CWE-942, CVSS 8.1)
`apps.desk365.io/KaniPSA/` (US + EU) returns `ACAO: *` on all responses incl. authenticated. With XSS + localStorage JWT → cross-origin theft of all support tickets/PII. PUT/POST allowed.

### D-05 — Internal infra disclosure & exposed staging (Medium, CWE-200, CVSS 5.8)
`msbots.desk365.io` prints `prod-teams-bot-vm-01`; staging WP with 12 users + same vuln plugin stack; CT logs expose jenkins/staging2-4/sqs/test365 subdomains.

### D-06 — Jetpack connection status endpoint public (Low/Info, CWE-200, CVSS 3.7)
`/wp-json/jetpack/v4/connection` returns config; `hasConnectedOwner:false` implies degraded Jetpack security modules. By-design but fingerprinting aid.

---

## Ghar Soaps — gharsoaps.shop / ghar-soaps.myshopify.com

### GS-01 — Quantity limit bypass (limit5 tag) (High, CVSS 7.5)
`limit5` enforced only client-side; `cart/add.js` accepts qty 10+. All 102 products tagged, 215 variants `inventory_management:null`.

### GS-02 — Unlimited cart quantity, no server ceiling (High, CVSS 7.5)
`cartCreate` accepts qty 9999 (3.98M INR cart). Only INT_MAX overflow-protected. Inventory/fulfillment stress.

### GS-03 — Invalid SPF + email spoofing (High, CVSS 7.4)
Two SPF records (RFC 7208 invalid), both `~all`; duplicate DMARC `p=none`, no rua. Spoof @gharsoaps.shop to 10L+ customers.

### GS-04 — UCP/MCP AI agent endpoint exposed (Medium, CVSS 6.5)
`/.well-known/ucp` + `/api/ucp/mcp` unauthenticated; leaks Google Pay merchant_id/gateway IDs; MCP errors leak internal routing.

### GS-05 — store.gharsoaps.shop GCP IAP backend unavailable (Medium, CVSS 5.3)
Resolves to GCP IAP (Error 52 BACKEND_UNAVAILABLE); IAP blocking works, but abandoned backend + live DNS/routing is risk.

### GS-06 — Full product catalog & pricing disclosed (Medium, CVSS 5.3)
`products.json?limit=250` → 102 products/215 variants w/ price+compare_at; GraphQL introspection enabled. No storefront password.

### GS-07 — HSTS max-age below minimum (Medium, CVSS 4.8)
`max-age=7889238` (~91d) on main domain vs 1yr recommended. ~270-day SSL-strip gap.

### GS-08 — Duplicate DMARC records (Low, CVSS 3.7)
Two `_dmarc` TXT records → receivers must not apply DMARC (RFC 7489). Compounds GS-03. No rua/ruf.

### GS-09 — Missing security.txt (Info, CVSS 2.0)
No `/.well-known/security.txt` (RFC 9116).

### GS-10 — Google Pay merchant ID disclosed in UCP (Info, CVSS 2.5)
merchant_id `16708973830884969730` + gatewayMerchantId in unauth UCP response. Low (generally public).

### GS-CSRF-001 — CSRF on /api/mcp JSONRPC update_cart (High, CWE-352, CVSS 7.1)
Unauthenticated `/api/mcp` accepts cross-origin state change (no token, no Origin check, SameSite=Lax). Silent cart population + cart-fixation. Tools exposed: update_cart, get_cart, search_catalog, etc. Also CWE-306 (missing auth).

---

## mCaffeine — www.mcaffeine.com / iamcaffeine.myshopify.com

### MC-01 — UCP/MCP full merchant config disclosure (Medium, CWE-200, CVSS 5.3)
`/.well-known/ucp` leaks Google Pay merchant_id, gateway 14545188, internal myshopify domain, OIDC config + issuer `shopify.com/authentication/14545188`.

### MC-02 — Absent CSP script-src — full XSS enablement (High, CWE-1021, CVSS 7.4)
CSP has no `script-src`/`default-src`/nonce. Search reflects `javascript:alert(1)`/`onerror` strings. Any HTML injection = unrestricted XSS.

### MC-03 — jQuery 1.9.1 multiple CVEs (Medium, CWE-1104, CVSS 6.1)
EOL jQuery from googleapis. CVE-2015-9251, 2019-11358 (proto pollution), 2020-11022/11023 (XSS). `cart/update.js` accepts `__proto__` payload (HTTP 200).

### MC-04 — HulkApps Form Builder config/email disclosure (Low, CWE-200, CVSS 3.7)
Inline HTML leaks `woot@mcaffeine.com`, HulkApps shop UUID/id 53134, Shopify Plus confirmation, store domain, creation date.

### MC-05 — Mobile app identifier disclosure via /.well-known/ (Info, CWE-200)
AASA: bundle `com.coffye.mcaffeine`, Team ID `XY8WRY72D4`. assetlinks: 2 SHA-256 certs (possible debug cert trusted in prod).

### MC-06 — GraphQL Storefront introspection enabled unauth (Low, CWE-200, CVSS 3.5)
30 query types exposed. IDOR not exploitable (Shopify enforces scopes) but full schema mapped; bulk scraping trivial.

### MC-07 — Short HSTS max-age (Low, CWE-319, CVSS 3.1)
`max-age=7889238` (~91d). `support.mcaffeine.com` all ports timeout (offline/firewalled).

### MC-08 — Affiliate ID exfiltration to third-party API (Info, CWE-359)
Inline JS sends `gbaid` URL param to `api-brokenlinkmanager.seoant.com`. Dev/QA/sandbox GoKwik analytics endpoints active in production.

### MC-09 — Snapmint Unleash feature-flag full dump via hardcoded key (High, CWE-798, CVSS 7.5)
`checkout-merchant.snapmint.com/js/v1/5827` embeds `clientKey:'proxy-client-key'`; `unleash-proxy-prod.snapmint.com/proxy` dumps 400+ flags incl. `skipBureauCheck`, `admin_pan_verification`, `Force_Logout`, credit-limit bypass, partner names, ~400 JIRA IDs. Reached via mCaffeine's payment integration.

### MC-10 — Snapmint merchant IDOR (sequential JS enumeration) (Medium, CWE-639, CVSS 5.3)
`/js/v1/{merchant_id}` predictable; 5827=mCaffeine, 5830=other merchant (Campus Sutra). Enumerates Snapmint's full merchant list + configs.

### MC-11 — GoKwik dev analytics hardcoded in prod JS (Medium, CWE-912/200, CVSS 5.3)
`devanalytics.gokwik.co/analytics.js` hardcodes `dev-hits.gokwik.co`, has `console.log("here deployed")`, POSTs prod user session data to dev API. 5 non-prod GoKwik endpoints live (last modified 2022).

### MC-12 — appsmav.com Scratch-Win hardcoded contest ID (Low, CWE-200, CVSS 3.1)
`win.appsmav.com/script.js` (iFrameResizer v3.5.1, 2015 EOL) leaks contest ID `bahc` in comment. Enables direct backend nav bypassing page-layer limits.

---

## CAMU — mycamu.co.in (multi-tenant college ERP)

### CA-M-01 — 87 Angular HTML templates publicly accessible (Medium)
Admin dashboard, student search, billing, exam results, transcripts all HTTP 200, no auth. Reveals data model & controllers.

### CA-M-02 — No rate limiting on auth endpoints (Medium)
`/login/otprequest`, `/changepasswordrequest`, `/reset` — 10/10 rapid requests succeed. OTP/reset-token brute force at machine speed.

### CA-L-01 — /login/create unhandled 500 (Low)
`POST /login/create {}` → 500 "Something broke!"; no input validation; potential DoS.

### CA-L-02 — Anti-debugging controls / security by obscurity (Low)
`disable-devtool.min.js` + `ALLOW_DEV_TOOLS=false`. Trivially bypassed; implies hidden client logic.

### CA-I-01 — Institution enumeration via instCode (Info)
`otprequest` reveals tenant codes TCE, TCEM, KCT, AVIT, SSIM, JMC via `{"code":"duplicate"}`.

### CA-I-02 — Old AWS SDK loaded client-side (Info)
AWS SDK v2.279.1 (2018); S3 `config.js` currently access-denied — if exposed, leaks Cognito/credentials.

---

## TCE — tce.edu and subdomains

### T-01 — Drupal JSON:API unauth user enumeration (High, CVSS 5.3)
`/jsonapi/user/user` returns admin, moderator1, moderator2 with UUIDs. Feeds credential stuffing/phishing.

### T-02 — Drupal 7.90 EOL on gr.tce.edu grievance portal (High, CVSS 7.3)
EOL since Jan 2025, unpatched. CHANGELOG.txt, xmlrpc.php, open user registration, browsable includes/bootstrap.inc all exposed.

### T-03 — TCENet login: no CSRF, no rate limit, no CAPTCHA (Medium, CVSS 5.3)
`/py/ident/login.py/auth_check` (Python CGI 6.4.3) plain POST, CSRF-forced login + brute-force possible. Chains with T-01 usernames.

### T-04 — JSON:API exposes full node content & revisions (Medium, CVSS 5.3)
`/jsonapi/node/page` (all node types) leaks body HTML, nid/vid, revision_uid → admin UUID, file URI structure.

### T-05 — Missing security headers on www.tce.edu (Low, CVSS 4.2)
No CSP/HSTS/Permissions-Policy/Referrer-Policy. XFO + nosniff present. HTTPS redirect not HSTS-enforced.

---

## TNSTC — tnstc.in/OTRSOnline + /SETCPG (authorized, written approval)

15 confirmed vulnerabilities. **Note: SQLi findings caused real platform-wide DoS during testing.**

### TN-01 — SQLi/DoS on SETCPG manageGatewayTransactionStatus.do (CRITICAL, CWE-89/400)
`txtObRefNo=12345678' OR '1'='1` → 711s hang + endpoint unresponsive. Appeared patched after session 1.

### TN-14 — SQLi/DoS on OTRSOnline manageGatewayTransactionStatus.do — ACTIVE/UNPATCHED (CRITICAL, CWE-89/400)
Three injectable params (`txtObRefNo`, `checkType`, `hiddenAction`). Unparameterized WHERE → full-table scan on PNRMASTER (5M+ rows) → thread-pool exhaustion → entire platform offline (HTTP 000) from a single unauth request.

### TN-15 — Blind SQLi: full DB exfiltration + privileged user (CRITICAL, CWE-89/200)
BENCHMARK time-blind on `txtObRefNo`. Confirmed: MySQL 5.7.x, DB `tnstcoprs`, user `ut06@%` with **FILE + SUPER** privileges. Tables: USERMASTER (50+ staff), LOGIN, DEPOTDETAIL, PNRMASTER (5M+ rows, PII cols). Live passenger PNR **T80558755** confirmed present.

### TN-02 — Session Fixation (High, CWE-384)
`jsessionid` in URL accepted and not regenerated on form submit; attacker-set session reusable.

### TN-03 — jsessionid leaked to third-party CDNs (High, CWE-598/200)
Session token in URL → sent via Referer to jquery.com, bootstrapcdn, cdnjs. Hijackable from CDN logs.

### TN-04 — No OTP rate limiting on ticket cancellation (High, CWE-307)
`manageNewTicketCancellation.do` — unlimited OTP attempts, no lockout/CAPTCHA. With known PNR → cancel any ticket.

### TN-10 — IDOR on booking history (High, suspected/pending)
`manageGuestViewBookingHistory.do` needs only PNR+mobile, no session auth. Test PNRs returned no-record.

### TN-11 — CAPTCHA bypass on login (High, CWE-307)
`jqreq.do?ValidateCredentails=...&Details=<b64user>,<b64pass>` validates creds before/without CAPTCHA, no rate limit. Enables brute force of 14 staff accounts.

### TN-12 — getCaptcha.do exposes CAPTCHA answer in plaintext (High, CWE-916/200)
`GET /getCaptcha.do` returns the answer as plain text, no session binding. CAPTCHA = zero security value.

### TN-05 — CSRF on booking history & conductor lookup (Medium, CWE-352)
No CSRF tokens; attacker page auto-POSTs victim mobile/PNR, reads result in iframe.

### TN-06 — Clickjacking (Medium, CWE-1021)
No X-Frame-Options / frame-ancestors. Transparent iframe steals passenger input.

### TN-07 — Internal email exposure (Medium, CWE-200)
18 internal TNSTC emails (incl. Gmail/Yahoo) in public HTML. Targeted phishing; all confirmed valid accounts (TN-13).

### TN-08 — Missing security headers (full suite) (Medium, CWE-693)
No CSP/XFO/X-Content-Type/X-XSS/Permissions/Referrer.

### TN-13 — User enumeration via login response (Medium, CWE-204)
HTTP 200 "Not Valid" = account exists; HTTP 500 = no account. 14 staff accounts confirmed valid.

### TN-09 — Hidden API action enumeration (jqreq.do) (Low)
20+ undocumented actions (PackageBook, BookSeat, ConfirmBooking…) return 500 when probed, confirming existence.

**Attack chain:** TN-07 emails → TN-13 enumeration → TN-11/TN-12 CAPTCHA defeat → unlimited brute force → staff account takeover. Separately TN-10 IDOR → TN-04 OTP brute → cancel any ticket.

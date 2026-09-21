# Security Findings — Consolidated Bug Report

Aggregated from local engagement notes across 8 assessed targets. Engagements dated 2026-05.

| Target | Findings | Highest Severity |
|---|---|---|
| mCaffeine | 1 | Medium |
| TNSTC OTRSOnline | 4 | Critical |

---

## mCaffeine — www.mcaffeine.com / iamcaffeine.myshopify.com

### MC-10 — Snapmint merchant IDOR (sequential JS enumeration) (Medium, CWE-639, CVSS 5.3)
`/js/v1/{merchant_id}` predictable; 5827=mCaffeine, 5830=other merchant (Campus Sutra). Enumerates Snapmint's full merchant list + configs.

---

## TNSTC — tnstc.in/OTRSOnline + /SETCPG (authorized, written approval)

**Note: SQLi findings caused real platform-wide DoS during testing.**

### TN-01 — SQLi/DoS on SETCPG manageGatewayTransactionStatus.do (CRITICAL, CWE-89/400)
`txtObRefNo=12345678' OR '1'='1` → 711s hang + endpoint unresponsive. Appeared patched after session 1.

### TN-14 — SQLi/DoS on OTRSOnline manageGatewayTransactionStatus.do — ACTIVE/UNPATCHED (CRITICAL, CWE-89/400)
Three injectable params (`txtObRefNo`, `checkType`, `hiddenAction`). Unparameterized WHERE → full-table scan on PNRMASTER (5M+ rows) → thread-pool exhaustion → entire platform offline (HTTP 000) from a single unauth request.

### TN-15 — Blind SQLi: full DB exfiltration + privileged user (CRITICAL, CWE-89/200)
BENCHMARK time-blind on `txtObRefNo`. Confirmed: MySQL 5.7.x, DB `tnstcoprs`, user `ut06@%` with **FILE + SUPER** privileges. Tables: USERMASTER (50+ staff), LOGIN, DEPOTDETAIL, PNRMASTER (5M+ rows, PII cols). Live passenger PNR **T80558755** confirmed present.

### TN-10 — IDOR on booking history (High, suspected/pending)
`manageGuestViewBookingHistory.do` needs only PNR+mobile, no session auth. Test PNRs returned no-record.

# Findable • Live Map Scan (Local Falcon API)

Minimal app that lets your reps run a **live Local Falcon scan** on a call and send a **white‑label report link** by email/SMS.

## Files
- `server.js` — Node/Express server exposing `/api/lf-scan` and `/api/lf-status` + serving the UI.
- `public/scan.html` — simple UI for reps.
- `package.json` — Node app config.

## Environment variables (set in DigitalOcean App Platform)
- `LF_API_KEY` — your Local Falcon API key
- `LF_START_URL` — On‑Demand **start scan** endpoint URL from Local Falcon docs
- `LF_STATUS_URL` — On‑Demand **status** endpoint URL from Local Falcon docs
- `LF_REPORT_URL` — Data retrieval endpoint base to fetch results (append `/SCAN_ID`)
- `GHL_WEBHOOK_URL` — (*optional*) GHL "Webhook Received" URL to auto‑notify a workflow when a scan finishes

## Run locally (optional)
```
npm install
LF_API_KEY=xxx LF_START_URL=... LF_STATUS_URL=... LF_REPORT_URL=... npm start
# open http://localhost:8080/scan.html
```

## Deploy to DigitalOcean App Platform (high level)
1) Push this folder to a GitHub repo.
2) In DO → Apps → Create App → connect the repo.
3) Set environment variables above.
4) Deploy. Open the URL → `/scan.html`.
5) Map `scan.yourdomain.com` in App settings → Domains (add a CNAME in DNS).


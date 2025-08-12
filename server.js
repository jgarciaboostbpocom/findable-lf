import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public")); // serves /public/scan.html

const {
  LF_API_KEY,
  LF_START_URL,
  LF_STATUS_URL,
  LF_REPORT_URL,
  GHL_WEBHOOK_URL
} = process.env;

// Kick off a scan
app.post("/api/lf-scan", async (req, res) => {
  try {
    const { placeId, lat, lng, keyword, gridSize = 7, radius = 2, name = "" } = req.body || {};
    if (!keyword || (!placeId && (lat == null || lng == null))) {
      return res.status(400).json({ error: "Provide keyword and either placeId or lat/lng." });
    }
    const r = await fetch(LF_START_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LF_API_KEY}` },
      body: JSON.stringify({
        place_id: placeId || undefined,
        lat: placeId ? undefined : lat,
        lng: placeId ? undefined : lng,
        keyword,
        grid_size: gridSize,
        radius_km: radius,
        name
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.message || "Start failed");
    res.json({ jobId: data.job_id, scanId: data.scan_id || null });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Poll status and return results
app.get("/api/lf-status", async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ error: "Missing jobId" });
    const r = await fetch(`${LF_STATUS_URL}?job_id=${encodeURIComponent(jobId)}`, {
      headers: { Authorization: `Bearer ${LF_API_KEY}` }
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.message || "Status failed");

    if (data.status === "complete") {
      const scanId = data.scan_id;
      const rr = await fetch(`${LF_REPORT_URL}/${encodeURIComponent(scanId)}`, {
        headers: { Authorization: `Bearer ${LF_API_KEY}` }
      });
      const result = await rr.json();
      if (!rr.ok) throw new Error(result?.message || "Result failed");

      // Optional: notify GHL
      if (GHL_WEBHOOK_URL) {
        try {
          await fetch(GHL_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scanId, result })
          });
        } catch {}
      }

      return res.json({ done: true, scanId, result });
    }
    res.json({ done: false, progress: data.progress || 0 });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Simple redirect to the UI
app.get("/", (_, res) => res.redirect("/scan.html"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Findable LF app running on", port));

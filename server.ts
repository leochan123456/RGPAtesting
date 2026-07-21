import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { exec } from "child_process";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini client safely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  // API route for Gemini Chat Audits
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt parameter" });
      }

      if (!ai) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is not configured. Please supply it via Settings > Secrets." 
        });
      }

      const systemInstruction = `# ROLE AND STRATEGIC MISSION:
You are the Lead Digital Compliance and Platform Economics Auditor for Ricacorp Properties Limited (License: C-001702). Your task is to process raw scraped developer logs, marketing updates, API changelogs, and Estate Agents Authority (EAA) regulatory practice circulars. You must filter out general developer noise and distill raw data into a strictly structured, programmatic negative constraint array to enforce 100% compliance on frontline real estate copy generation.

# SYSTEM COMPLIANCE BASELINE (KNOWLEDGE SOURCE):
You must evaluate all platform updates against our hardcoded sell-side market baseline:
1. EAA Regulatory Reality: Online property ad complaints have risen 1.85 times from 27 cases (2024) to 77 cases (2025), representing over 95% of all real estate advertising complaints. Disciplinary委員会 penalties can reach HKD 300,000, 1-year imprisonment, and direct license revocation (83 licenses revoked, 9 suspended in 2025).
2. Instagram & Meta: Enforces a rigid 3-5 hashtag threshold. Shadowban is triggered if Account Trust Score falls below 60, or if identical listing visual assets are cross-posted more than 10 times in 30 days.
3. Xiaohongshu (小紅書): Implements a zero-tolerance model for off-platform redirection ("Chao Ke"). Attempting to share WeChat IDs, numbers, or phonetics (e.g., VX, V❤️) triggers an immediate 30-day private messaging ban.
4. Douyin (抖音): Flags and blocks real estate speculation terminology such as "guaranteed return", "housing market boom", or "wealth explosion".

# EVALUATION INSTRUCTIONS:
Compare the incoming [Raw_Platform_Changelog_Data] against our current operational rules. Look specifically for changes in:
- New prohibited keywords or speculative financial phrasing.
- Changes in hashtag frequency limitations or media container dimensions.
- Anti-spam threshold modifications, direct message constraints, or platform API asset logging资費 structure.

# OUTPUT STRUCTURE (JSON FORMAT REQUIRED):
You must only respond in a valid JSON object. Do not wrap code blocks in markdown text outside the structure. Format your response exactly as follows:

{
  "update_detected": "TRUE" or "FALSE",
  "affected_platforms": ["Meta", "Xiaohongshu", "Douyin", "Telegram", "None"],
  "dynamic_negative_prompts": {
    "scrub_keywords": ["LIST_OF_NEW_PROHIBITED_OR_HIGH_RISK_WORDS"],
    "hashtag_maximum_limit": 5, 
    "chao_ke_masking_enabled": true
  },
  "technical_payload_adjustments": {
    "caption_character_cap": 1024,
    "required_resolution_width": 1920,
    "required_resolution_height": 1080
  },
  "discord_alert_payload": {
    "severity": "CRITICAL" or "INFO",
    "summary_text": "A brief 2-sentence Traditional Chinese summary explaining the change and its operational impact on real estate agents."
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = response.text || "";
      res.json({ response: responseText });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Gemini API execution failed" });
    }
  });

  // GET platform policy rules from restriction_rules.json
  app.get("/api/policy-rules", (req, res) => {
    const rulesPath = path.join(process.cwd(), "research_data", "restriction_rules.json");
    if (!fs.existsSync(rulesPath)) {
      return res.json([]);
    }
    try {
      const data = fs.readFileSync(rulesPath, "utf-8");
      res.json(JSON.parse(data));
    } catch (err: any) {
      res.status(500).json({ error: "Failed to read policy rules: " + err.message });
    }
  });

  // GET policy snapshots from SQLite db using zero-dependency python command
  app.get("/api/policy-snapshots", (req, res) => {
    const cmd = `python3 -c "import sqlite3, json, os; db='research_data/research.db'; conn = sqlite3.connect(db) if os.path.exists(db) else None; conn.row_factory = sqlite3.Row if conn else None; print(json.dumps([dict(r) for r in conn.execute('SELECT platform, source_url, fetched_at, snapshot_path, content_hash, content_length FROM snapshots ORDER BY fetched_at DESC').fetchall()])) if conn else print('[]')"`
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("snapshots query error:", err, stderr);
        return res.json([]);
      }
      try {
        res.json(JSON.parse(stdout.trim()));
      } catch (e: any) {
        res.json([]);
      }
    });
  });

  // GET shadowban checks from SQLite db using zero-dependency python command
  app.get("/api/shadowban-checks", (req, res) => {
    const cmd = `python3 -c "import sqlite3, json, os; db='research_data/research.db'; conn = sqlite3.connect(db) if os.path.exists(db) else None; conn.row_factory = sqlite3.Row if conn else None; print(json.dumps([dict(r) for r in conn.execute('SELECT post_url, platform, checked_at, elapsed_hours, views, flagged, reason, metadata FROM shadowban_checks ORDER BY checked_at DESC').fetchall()])) if conn else print('[]')"`
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("shadowban query error:", err, stderr);
        return res.json([]);
      }
      try {
        res.json(JSON.parse(stdout.trim()));
      } catch (e: any) {
        res.json([]);
      }
    });
  });

  // POST to trigger One-Click Update of policy rules (runs research.main run)
  app.post("/api/policy-rules/update", (req, res) => {
    exec("python3 -m research.main run", (err, stdout, stderr) => {
      if (err) {
        console.error("One-click update error:", err, stderr);
        return res.status(500).json({ error: "Failed to update: " + (stderr || err.message) });
      }
      const rulesPath = path.join(process.cwd(), "research_data", "restriction_rules.json");
      try {
        const data = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, "utf-8") : "[]";
        res.json({ success: true, stdout: stdout, rules: JSON.parse(data) });
      } catch (e: any) {
        res.json({ success: true, stdout: stdout, rules: [] });
      }
    });
  });

  // POST to trigger shadowban check run
  app.post("/api/shadowban-checks/run", (req, res) => {
    const { post_url, platform } = req.body;
    if (!post_url || !platform) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const safeUrl = post_url.replace(/'/g, "\\'");
    const safePlatform = platform.replace(/'/g, "\\'");
    exec(`python3 -m research.main shadowban --post-url '${safeUrl}' --platform '${safePlatform}'`, (err, stdout, stderr) => {
      if (err) {
        console.error("Shadowban run error:", err, stderr);
        return res.status(500).json({ error: "Check failed: " + (stderr || err.message) });
      }
      try {
        const outputText = stdout.trim();
        const startIdx = outputText.indexOf('{');
        if (startIdx !== -1) {
          const parsed = JSON.parse(outputText.substring(startIdx));
          res.json(parsed);
        } else {
          res.json({ success: true, raw: stdout });
        }
      } catch (e: any) {
        res.json({ success: true, raw: stdout });
      }
    });
  });

  // Vite middleware setup for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

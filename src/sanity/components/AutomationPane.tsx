"use client";

import React, { useEffect, useMemo, useState } from "react";

type RunResult = any;

export default function AutomationPane() {
  const [secret, setSecret] = useState("");
  const [stage, setStage] = useState<"write" | "score" | "rss">("write");
  const [dryRun, setDryRun] = useState(false);
  const [debug, setDebug] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storageKey = useMemo(() => "tap_signals_run_secret", []);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setSecret(saved);
  }, [storageKey]);

  function saveSecret(next: string) {
    setSecret(next);
    window.localStorage.setItem(storageKey, next);
  }

  async function runNow() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/signals/run", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-tap-secret": secret.trim(),
        },
        body: JSON.stringify({
          stage,
          dryRun: dryRun ? 1 : 0,
          debug: debug ? 1 : 0,
        }),
      });

      const text = await res.text();
      let payload: any = text;
      try {
        payload = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        setError(
          `Request failed (${res.status}). ${
            typeof payload === "string" ? payload : payload?.error || "Unknown error"
          }`
        );
        setResult(payload);
        return;
      }

      setResult(payload);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function checkStatus() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/signals/run", { method: "GET", cache: "no-store" });
      const payload = await res.json();
      setResult(payload);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2 style={{ margin: "0 0 8px" }}>Signals Automation</h2>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Runs your ingestion pipeline and writes suggested signals to Sanity.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600 }}>Run Secret (x-tap-secret)</div>
          <input
            value={secret}
            onChange={(e) => saveSecret(e.target.value)}
            placeholder="Paste TAP_SIGNALS_WEBHOOK_SECRET here"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Stored in your browser localStorage. Anyone with Studio access on *this* computer could run it.
          </div>
        </label>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 600 }}>Stage</div>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="rss">rss (fetch only)</option>
              <option value="score">score (fetch + model)</option>
              <option value="write">write (create docs)</option>
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 26 }}>
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            dryRun
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 26 }}>
            <input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} />
            debug
          </label>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={runNow}
            disabled={loading || !secret.trim()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111",
              background: loading ? "#eee" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Running…" : "Run Signals Now"}
          </button>

          <button
            onClick={checkStatus}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Check Endpoint Status
          </button>
        </div>

        {error ? (
          <div style={{ padding: 12, borderRadius: 10, background: "#ffecec", border: "1px solid #ffb3b3" }}>
            <div style={{ fontWeight: 700 }}>Error</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
          </div>
        ) : null}

        {result ? (
          <div style={{ padding: 12, borderRadius: 10, background: "#f6f6f6", border: "1px solid #ddd" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Response</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
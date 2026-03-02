// src/app/api/cron/marginalia/route.ts
import { runSignalsIngestion } from "@/lib/signals/runSignalsIngestion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Stage = "env" | "rss" | "score" | "write";

function truthy(v?: string | null) {
  return Boolean((v || "").trim());
}

function getEnvSnapshot() {
  return {
    hasCronSecret: truthy(process.env.CRON_SECRET),
    hasOpenAI: truthy(process.env.OPENAI_API_KEY),
    hasSanityWrite: truthy(process.env.SANITY_API_WRITE_TOKEN),
    // allow either server-only or NEXT_PUBLIC variants for project/dataset/apiVersion
    hasSanityProjectId: truthy(process.env.SANITY_PROJECT_ID) || truthy(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
    hasSanityDataset: truthy(process.env.SANITY_DATASET) || truthy(process.env.NEXT_PUBLIC_SANITY_DATASET),
    hasSanityApiVersion: truthy(process.env.SANITY_API_VERSION) || truthy(process.env.NEXT_PUBLIC_SANITY_API_VERSION),
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const secret = (process.env.CRON_SECRET || "").trim();
    const key = (url.searchParams.get("key") || "").trim();

    // Enforce cron auth HERE (do not rely on downstream functions for this)
    if (secret && key !== secret) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const dryRun = url.searchParams.get("dryRun") === "1";
    const debug = url.searchParams.get("debug") === "1";

    const stageParam = (url.searchParams.get("stage") || (dryRun ? "rss" : "write")) as Stage;

    // Handy: /api/cron/marginalia?key=...&stage=env
    if (stageParam === "env") {
      return Response.json({
        ok: true,
        route: "/api/cron/marginalia",
        env: getEnvSnapshot(),
      });
    }

    // Optional guard: if attempting to write for real, ensure write token exists
    if (stageParam === "write" && !dryRun && !truthy(process.env.SANITY_API_WRITE_TOKEN)) {
      return Response.json(
        {
          ok: false,
          error: "Missing SANITY_API_WRITE_TOKEN (required for write stage)",
          env: getEnvSnapshot(),
        },
        { status: 500 }
      );
    }

    const stage = stageParam as "rss" | "score" | "write";

    const result = await runSignalsIngestion({
      dryRun,
      debug,
      stage,
      cronKey: key,
    });

    return Response.json(result);
  } catch (err: any) {
    const msg = err?.message ? String(err.message) : String(err);

    const status =
      msg.includes("Unauthorized") ? 401 :
      msg.includes("Insufficient permissions") ? 403 :
      500;

    return Response.json(
      {
        ok: false,
        error: msg,
        stack: err?.stack ? String(err.stack) : undefined,
      },
      { status }
    );
  }
}
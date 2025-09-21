#!/usr/bin/env node
// Simple seed runner for Convex scenarios.seed mutation.
// Usage:
//   NEXT_PUBLIC_CONVEX_URL="https://<your-deployment>.convex.cloud" node scripts/seedScenarios.mjs
// or run `npx convex dev` in another terminal so `.env.local` is populated, then:
//   node scripts/seedScenarios.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";

// Load NEXT_PUBLIC_CONVEX_URL from .env.local if present (no dotenv dependency needed)
function loadEnvLocal() {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const envPath = path.resolve(__dirname, "../.env.local");
		if (!fs.existsSync(envPath)) return;
		const content = fs.readFileSync(envPath, "utf-8");
		for (const line of content.split(/\r?\n/)) {
			if (!line || line.trim().startsWith("#")) continue;
			const idx = line.indexOf("=");
			if (idx === -1) continue;
			const key = line.slice(0, idx).trim();
			let val = line.slice(idx + 1).trim();
			if (
				(val.startsWith('"') && val.endsWith('"')) ||
				(val.startsWith("'") && val.endsWith("'"))
			) {
				val = val.slice(1, -1);
			}
			if (!process.env[key]) process.env[key] = val;
		}
	} catch (_) {
		// ignore
	}
}

async function main() {
	loadEnvLocal();
	const convexUrl =
		process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
	if (!convexUrl) {
		console.error(
			"Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL.\n- Run `npx convex dev` in a separate terminal to populate .env.local, or\n- Provide the URL inline: NEXT_PUBLIC_CONVEX_URL=... node scripts/seedScenarios.mjs"
		);
		process.exit(1);
	}

	const client = new ConvexHttpClient(convexUrl);
	console.log(`Seeding scenarios to ${convexUrl} ...`);
	await client.mutation("scenarios:seed", {});
	console.log(
		"Scenarios seeded (14 days). You can run this again; it's idempotent by day."
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

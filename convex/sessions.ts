import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateCode() {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid ambiguous chars
	let code = "";
	for (let i = 0; i < 4; i++)
		code += chars[Math.floor(Math.random() * chars.length)];
	return code;
}

export const create = mutation({
	args: { hostId: v.optional(v.string()) },
	handler: async (ctx, args) => {
		// Ensure unique sessionCode
		let code = generateCode();
		// Try a few times to avoid collision
		for (let i = 0; i < 5; i++) {
			const existing = await ctx.db
				.query("sessions")
				.withIndex("by_code", (q) => q.eq("sessionCode", code))
				.unique();
			if (!existing) break;
			code = generateCode();
		}

		const hostId = args.hostId ?? crypto.randomUUID();
		await ctx.db.insert("sessions", {
			sessionCode: code,
			gameState: "LOBBY",
			currentDay: 0,
			hostId,
		});
		return { sessionCode: code, hostId } as const;
	},
});

export const getSessionByCode = query({
	args: { sessionCode: v.string() },
	handler: async (ctx, { sessionCode }) => {
		const session = await ctx.db
			.query("sessions")
			.withIndex("by_code", (q) => q.eq("sessionCode", sessionCode))
			.unique();
		return session ?? null;
	},
});

export const startGame = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		await ctx.db.patch(sessionId, { gameState: "IN_GAME", currentDay: 1 });
		return true;
	},
});

export const advanceDay = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		const nextDay = (session.currentDay ?? 0) + 1;
		if (nextDay > 14) {
			// Before finishing the game, deduct unpaid loan amounts from all players
			const players = await ctx.db
				.query("players")
				.withIndex("by_session", (q) => q.eq("sessionId", sessionId))
				.collect();

			for (const player of players) {
				if ((player.loanBalance ?? 0) > 0) {
					// Deduct the unpaid loan amount with 10% interest from final resources
					const unpaidLoanWithInterest = Math.round(
						(player.loanBalance ?? 0) * 1.1
					);
					const finalResources =
						(player.resources ?? 0) - unpaidLoanWithInterest;

					await ctx.db.patch(player._id, {
						resources: finalResources,
						loanBalance: 0, // Clear the loan balance since it's been deducted
					});
				}
			}

			await ctx.db.patch(sessionId, { gameState: "FINISHED" });
		} else {
			await ctx.db.patch(sessionId, { currentDay: nextDay });
		}
		return true;
	},
});

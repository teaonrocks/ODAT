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

export const startInstructions = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		await ctx.db.patch(sessionId, { gameState: "INSTRUCTIONS", currentDay: 0 });
		return true;
	},
});

export const nextInstruction = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		const nextSlide = (session.currentDay ?? 0) + 1;
		// We'll use currentDay to track instruction slide number (0-11)
		await ctx.db.patch(sessionId, { currentDay: nextSlide });
		return true;
	},
});

export const prevInstruction = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		const prevSlide = Math.max(0, (session.currentDay ?? 0) - 1);
		await ctx.db.patch(sessionId, { currentDay: prevSlide });
		return true;
	},
});

export const startGame = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		await ctx.db.patch(sessionId, {
			gameState: "DAY_TRANSITION",
			currentDay: 1,
		});
		return true;
	},
});

export const showDayScenario = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");
		await ctx.db.patch(sessionId, { gameState: "IN_GAME" });
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
			await ctx.db.patch(sessionId, {
				gameState: "DAY_TRANSITION",
				currentDay: nextDay,
			});
		}
		return true;
	},
});

export const toggleLayoutPreference = mutation({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");

		const currentLayout = session.layoutPreference || "choices-top";
		const newLayout =
			currentLayout === "choices-top" ? "status-top" : "choices-top";

		await ctx.db.patch(sessionId, { layoutPreference: newLayout });
		return newLayout;
	},
});

export const setTransitionDuration = mutation({
	args: { sessionId: v.id("sessions"), duration: v.number() },
	handler: async (ctx, { sessionId, duration }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");

		// Validate duration (between 1 and 10 seconds)
		if (duration < 1000 || duration > 10000) {
			throw new Error("Duration must be between 1 and 10 seconds");
		}

		await ctx.db.patch(sessionId, { transitionDuration: duration });
		return duration;
	},
});

export const createGroup = mutation({
	args: { 
		sessionId: v.id("sessions"), 
		name: v.string(),
		color: v.string(),
	},
	handler: async (ctx, { sessionId, name, color }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");

		const currentGroups = session.groups || [];
		const groupId = crypto.randomUUID();
		
		const newGroup = {
			id: groupId,
			name,
			color,
		};

		await ctx.db.patch(sessionId, { 
			groups: [...currentGroups, newGroup] 
		});
		
		return newGroup;
	},
});

export const updateGroup = mutation({
	args: { 
		sessionId: v.id("sessions"), 
		groupId: v.string(),
		name: v.string(),
		color: v.string(),
	},
	handler: async (ctx, { sessionId, groupId, name, color }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");

		const currentGroups = session.groups || [];
		const updatedGroups = currentGroups.map(group => 
			group.id === groupId ? { ...group, name, color } : group
		);

		await ctx.db.patch(sessionId, { groups: updatedGroups });
		return true;
	},
});

export const deleteGroup = mutation({
	args: { 
		sessionId: v.id("sessions"), 
		groupId: v.string(),
	},
	handler: async (ctx, { sessionId, groupId }) => {
		const session = await ctx.db.get(sessionId);
		if (!session) throw new Error("Session not found");

		// Remove group from session
		const currentGroups = session.groups || [];
		const updatedGroups = currentGroups.filter(group => group.id !== groupId);
		await ctx.db.patch(sessionId, { groups: updatedGroups });

		// Remove group assignment from all players
		const players = await ctx.db
			.query("players")
			.withIndex("by_session", (q) => q.eq("sessionId", sessionId))
			.collect();

		for (const player of players) {
			if (player.groupId === groupId) {
				await ctx.db.patch(player._id, { groupId: undefined });
			}
		}

		return true;
	},
});

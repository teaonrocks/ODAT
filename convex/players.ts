import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
	args: { sessionCode: v.string(), name: v.string() },
	handler: async (ctx, { sessionCode, name }) => {
		const session = await ctx.db
			.query("sessions")
			.withIndex("by_code", (q) => q.eq("sessionCode", sessionCode))
			.unique();
		if (!session) throw new Error("Session not found");
		const id = await ctx.db.insert("players", {
			sessionId: session._id,
			name,
			resources: 150,
			familyHits: 0,
			healthHits: 0,
			jobHits: 0,
			isEmployed: true,
			loanBalance: 0,
			borrowCount: 0,
			ringPawned: false,
			choices: [],
		});
		return id;
	},
});

export const getForSession = query({
	args: { sessionId: v.id("sessions") },
	handler: async (ctx, { sessionId }) => {
		const players = await ctx.db
			.query("players")
			.withIndex("by_session", (q) => q.eq("sessionId", sessionId))
			.collect();
		return players;
	},
});

export const getById = query({
	args: { playerId: v.id("players") },
	handler: async (ctx, { playerId }) => {
		const player = await ctx.db.get(playerId);
		return player;
	},
});

export const makeChoice = mutation({
	args: {
		playerId: v.id("players"),
		day: v.number(),
		choice: v.string(), // "A" | "B"
		consequence: v.object({
			resourceChange: v.number(),
			narrative: v.string(),
			familyHits: v.optional(v.number()),
			healthHits: v.optional(v.number()),
			jobHits: v.optional(v.number()),
			removeFamilyHits: v.optional(v.number()),
		}),
	},
	handler: async (ctx, { playerId, day, choice, consequence }) => {
		const player = await ctx.db.get(playerId);
		if (!player) throw new Error("Player not found");

		// Check if player has already made a choice for this day
		const existingChoice = (player.choices ?? []).find((c) => c.day === day);
		if (existingChoice) {
			throw new Error("You have already made a choice for this day");
		}

		// Apply resource change
		const newResources =
			(player.resources ?? 0) + (consequence.resourceChange ?? 0);

		// Update hit counts based on consequence
		let familyHits = (player.familyHits ?? 0) + (consequence.familyHits ?? 0);
		let healthHits = (player.healthHits ?? 0) + (consequence.healthHits ?? 0);
		let jobHits = (player.jobHits ?? 0) + (consequence.jobHits ?? 0);
		let isEmployed = player.isEmployed ?? true;

		// Handle removeFamilyHits
		if (consequence.removeFamilyHits) {
			familyHits = Math.max(0, familyHits - consequence.removeFamilyHits);
		}

		// Apply accumulation rules
		// 3 familyHits -> 1 healthHit + reset family
		if (familyHits >= 3) {
			healthHits += 1;
			familyHits = 0;
		}

		// 3 healthHits -> 1 jobHit + reset health
		if (healthHits >= 3) {
			jobHits += 1;
			healthHits = 0;
		}

		// 3 jobHits -> unemployed (don't reset jobHits)
		if (jobHits >= 3) {
			isEmployed = false;
		}

		await ctx.db.patch(playerId, {
			resources: newResources,
			familyHits,
			healthHits,
			jobHits,
			isEmployed,
			choices: [...(player.choices ?? []), { day, choice, consequence }],
		});

		return {
			resources: newResources,
			familyHits,
			healthHits,
			jobHits,
			isEmployed,
		};
	},
});

export const borrowMoney = mutation({
	args: {
		playerId: v.id("players"),
		amount: v.number(),
	},
	handler: async (ctx, { playerId, amount }) => {
		const player = await ctx.db.get(playerId);
		if (!player) throw new Error("Player not found");

		if ((player.borrowCount ?? 0) >= 3) {
			throw new Error("Cannot borrow more than 3 times");
		}

		// Only allow borrowing in increments of $100, $200, $300, or $400
		const validAmounts = [100, 200, 300, 400];
		if (!validAmounts.includes(amount)) {
			throw new Error("You can only borrow $100, $200, $300, or $400");
		}

		const newBorrowCount = (player.borrowCount ?? 0) + 1;
		const newLoanBalance = (player.loanBalance ?? 0) + amount;
		const newResources = (player.resources ?? 0) + amount;

		await ctx.db.patch(playerId, {
			borrowCount: newBorrowCount,
			loanBalance: newLoanBalance,
			resources: newResources,
		});

		return {
			borrowCount: newBorrowCount,
			loanBalance: newLoanBalance,
			resources: newResources,
		};
	},
});

export const pawnRing = mutation({
	args: { playerId: v.id("players") },
	handler: async (ctx, { playerId }) => {
		const player = await ctx.db.get(playerId);
		if (!player) throw new Error("Player not found");

		if (player.ringPawned) {
			throw new Error("Ring is already pawned");
		}

		const newResources = (player.resources ?? 0) + 150;

		await ctx.db.patch(playerId, {
			ringPawned: true,
			resources: newResources,
		});

		return { ringPawned: true, resources: newResources };
	},
});

export const repayLoan = mutation({
	args: {
		playerId: v.id("players"),
		repaymentAmount: v.number(),
	},
	handler: async (ctx, { playerId, repaymentAmount }) => {
		const player = await ctx.db.get(playerId);
		if (!player) throw new Error("Player not found");

		if (repaymentAmount <= 0) {
			throw new Error("Repayment amount must be greater than 0");
		}

		if ((player.loanBalance ?? 0) === 0) {
			throw new Error("No loan balance to repay");
		}

		if ((player.loanBalance ?? 0) < repaymentAmount) {
			throw new Error("Repayment amount exceeds loan balance");
		}

		// Calculate total cost with 10% interest
		const totalCost = Math.round(repaymentAmount * 1.1);

		if ((player.resources ?? 0) < totalCost) {
			throw new Error(
				`Insufficient funds to repay $${repaymentAmount}. You need $${totalCost} (including 10% interest) but only have $${player.resources || 0}.`
			);
		}

		const newResources = (player.resources ?? 0) - totalCost;
		const newLoanBalance = (player.loanBalance ?? 0) - repaymentAmount;

		await ctx.db.patch(playerId, {
			resources: newResources,
			loanBalance: newLoanBalance,
		});

		return { resources: newResources, loanBalance: newLoanBalance };
	},
});

export const redeemRing = mutation({
	args: { playerId: v.id("players") },
	handler: async (ctx, { playerId }) => {
		const player = await ctx.db.get(playerId);
		if (!player) throw new Error("Player not found");

		if (!player.ringPawned) {
			throw new Error("Ring is not pawned");
		}

		const redemptionCost = 159; // 150 * 1.06 = 159

		if ((player.resources ?? 0) < redemptionCost) {
			throw new Error("Insufficient funds to redeem ring");
		}

		const newResources = (player.resources ?? 0) - redemptionCost;

		await ctx.db.patch(playerId, {
			ringPawned: false,
			resources: newResources,
		});

		return { ringPawned: false, resources: newResources };
	},
});

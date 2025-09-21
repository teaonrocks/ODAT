import { mutation } from "./_generated/server";

export const migratePlayersSchema = mutation({
	args: {},
	handler: async (ctx) => {
		const players = await ctx.db.query("players").collect();

		for (const player of players) {
			// Check if player already has the new fields
			if (player.borrowCount === undefined) {
				await ctx.db.patch(player._id, {
					familyHits: player.familyHits ?? 0,
					healthHits: player.healthHits ?? 0,
					jobHits: player.jobHits ?? 0,
					isEmployed: player.isEmployed ?? true,
					loanBalance: player.loanBalance ?? 0,
					borrowCount: player.borrowCount ?? 0,
					ringPawned: player.ringPawned ?? false,
					// Also update resources to new starting amount if it's still 100
					resources: player.resources === 100 ? 150 : player.resources,
				});
			}
		}

		return `Migrated ${players.length} players`;
	},
});

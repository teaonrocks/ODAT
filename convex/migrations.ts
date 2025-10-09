import { mutation } from "./_generated/server";

export const migratePlayersSchema = mutation({
	args: {},
	handler: async (ctx) => {
		const players = await ctx.db.query("players").collect();

		let updatedCount = 0;

		for (const player of players) {
			const legacyPlayer = player as typeof player & {
				finalReminderResolved?: boolean;
				loanReminderResolved?: boolean;
			};
			const patch: Record<string, unknown> = {};

			if (player.familyHits === undefined) {
				patch.familyHits = player.familyHits ?? 0;
			}

			if (player.healthHits === undefined) {
				patch.healthHits = player.healthHits ?? 0;
			}

			if (player.jobHits === undefined) {
				patch.jobHits = player.jobHits ?? 0;
			}

			if (player.isEmployed === undefined) {
				patch.isEmployed = player.isEmployed ?? true;
			}

			if (player.loanBalance === undefined) {
				patch.loanBalance = player.loanBalance ?? 0;
			}

			if (player.borrowCount === undefined) {
				patch.borrowCount = player.borrowCount ?? 0;
			}

			if (player.ringPawned === undefined) {
				patch.ringPawned = player.ringPawned ?? false;
			}

			if (player.loanReminderResolvedDay === undefined) {
				let resolvedDay: number | undefined = undefined;
				if (legacyPlayer.finalReminderResolved) {
					resolvedDay = 14;
				} else if (legacyPlayer.loanReminderResolved) {
					resolvedDay = 8;
				}

				if (resolvedDay !== undefined) {
					patch.loanReminderResolvedDay = resolvedDay;
				}
			}

			if (Object.prototype.hasOwnProperty.call(player, "finalReminderResolved")) {
				patch.finalReminderResolved = undefined;
			}

			if (Object.prototype.hasOwnProperty.call(player, "loanReminderResolved")) {
				patch.loanReminderResolved = undefined;
			}

			if (player.resources === 100) {
				patch.resources = 150;
			}

			if (Object.keys(patch).length > 0) {
				await ctx.db.patch(player._id, patch);
				updatedCount += 1;
			}
		}

		return `Migrated ${updatedCount} of ${players.length} players`;
	},
});

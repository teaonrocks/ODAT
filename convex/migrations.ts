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

export const updateNarrativesToPastTense = mutation({
	args: {},
	handler: async (ctx) => {
		const scenarios = await ctx.db.query("scenarios").collect();
		let updatedCount = 0;

		// Define all narrative updates by day
		const narrativeUpdates: Record<
			number,
			{
				optionA_narrative?: string;
				optionB_narrative?: string;
				optionB_text?: string;
				optionA_text?: string;
				subPages?: Array<{ title: string; content: string }>;
			}
		> = {
			1: {
				optionA_narrative:
					"You arrived at the interview full of energy and on time.",
			},
			2: {
				optionA_narrative:
					"By choosing a less nutritious option, your family suffered the ill effects of an unhealthy diet.",
				optionB_narrative:
					"It was expensive, but you provided healthy food for your family.",
			},
			3: {
				optionB_narrative: "Being late on your first day left a bad impression.",
			},
			5: {
				optionA_narrative:
					"Your bills were paid, ensuring a steady supply of water, gas, and electricity.",
				optionB_narrative:
					"You faced utilities disruptions and extra charges for late rent payment.",
			},
			6: {
				optionA_narrative:
					"You could be contacted for work and family emergencies.",
				optionB_narrative:
					"Your employer was furious with you for being uncontactable at work.",
			},
			7: {
				optionA_narrative:
					"You bought more food to ensure your family didn't go hungry.",
				optionB_narrative:
					"Skipping meals took a toll on your health and well-being.",
			},
			8: {
				subPages: [
					{
						title: "Loan & Ring",
						content:
							"You could choose to repay your loan. If you don't, you will receive one Health Hit.\nNo penalty for not redeeming your ring at this moment.",
					},
				],
			},
			9: {
				optionA_narrative:
					"Your daughter got to celebrate with her friend, strengthening their friendship.",
				optionB_narrative:
					"Your daughter blamed you for losing friends after you told her to decline a birthday invitation.",
				subPages: [
					{
						title: "Physical Needs Prioritised",
						content:
							"The 'need to belong' is often sacrificed to meet the more visible and immediate physical needs.",
					},
				],
			},
			10: {
				optionA_narrative:
					"A large but necessary expense. You could now cook at home again.",
				optionB_narrative:
					"You postponed addressing the broken stove by choosing to eat out, but the issue persisted.",
				optionB_text: "Eat out for a week and delay solving the stove issue",
				subPages: [
					{
						title: "No Savings",
						content:
							"Low-income families have little or no savings to meet huge unforeseen expenses.",
					},
				],
			},
			11: {
				optionA_narrative:
					"Taking time off to care for your daughter made her feel loved, but it upset your employer.",
				optionA_text: "Ask for time-off; bring daughter to the polyclinic",
				optionB_text:
					"Leave her in the sick bay; bring her to a private clinic at night after work",
			},
			12: {
				optionA_narrative:
					"You settled the conservancy charges and avoided legal trouble.",
				optionB_narrative:
					"You missed a day of work to resolve your legal issues but it damaged your standing at work.",
			},
			13: {
				optionB_narrative:
					"Your son missed out on a significant life experience, and he hated you for it.",
			},
			14: {
				optionA_narrative:
					"You made it! You received your second pay cheque.",
				optionB_narrative:
					"You were let go from your job and missed your second pay cheque.",
				optionB_text: "Out-of-job",
				subPages: [
					{
						title: "Loan & Ring",
						content:
							"You must repay your outstanding loan and redeem your wedding ring. If you don't, you will receive one Health Hit.",
					},
				],
			},
		};

		// Day 4 sub-page update
		const day4Update = {
			subPages: [
				{
					title: "Limited Cashflow",
					content:
						"Low-income families are often unable to take advantage of savings from bulk purchase.",
				},
			],
		};

		for (const scenario of scenarios) {
			const day = scenario.day;
			const updates = narrativeUpdates[day];
			const patch: Record<string, unknown> = {};

			// Skip days without updates (except Day 4)
			if (!updates && day !== 4) {
				continue;
			}

			// Handle Day 4 sub-page update
			if (day === 4 && day4Update.subPages) {
				patch.subPages = day4Update.subPages;
			}

			// Apply narrative and other updates
			if (updates) {
				// Update option A narrative if needed
				if (updates.optionA_narrative) {
					patch.optionA_consequence = {
						...scenario.optionA_consequence,
						narrative: updates.optionA_narrative,
					};
				}

				// Update option B narrative if needed
				if (updates.optionB_narrative) {
					patch.optionB_consequence = {
						...scenario.optionB_consequence,
						narrative: updates.optionB_narrative,
					};
				}

				// Update option texts if needed
				if (updates.optionA_text) {
					patch.optionA_text = updates.optionA_text;
				}

				if (updates.optionB_text) {
					patch.optionB_text = updates.optionB_text;
				}

				// Update sub-pages if needed (overrides Day 4 for days that have subPages in updates)
				if (updates.subPages) {
					patch.subPages = updates.subPages;
				}
			}

			// Only patch if there are changes
			if (Object.keys(patch).length > 0) {
				await ctx.db.patch(scenario._id, patch);
				updatedCount += 1;
			}
		}

		return `Updated narratives for ${updatedCount} of ${scenarios.length} scenarios`;
	},
});

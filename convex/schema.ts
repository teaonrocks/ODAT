import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	scenarios: defineTable({
		day: v.float64(),
		optionA_consequence: v.object({
			familyHits: v.optional(v.float64()),
			healthHits: v.optional(v.float64()),
			jobHits: v.optional(v.float64()),
			narrative: v.string(),
			removeFamilyHits: v.optional(v.float64()),
			resourceChange: v.float64(),
		}),
		optionA_text: v.string(),
		optionA_details: v.optional(v.array(v.string())),
		optionB_consequence: v.object({
			familyHits: v.optional(v.float64()),
			healthHits: v.optional(v.float64()),
			jobHits: v.optional(v.float64()),
			narrative: v.string(),
			removeFamilyHits: v.optional(v.float64()),
			resourceChange: v.float64(),
		}),
		optionB_text: v.string(),
		optionB_details: v.optional(v.array(v.string())),
		prompt: v.string(),
		subPages: v.optional(
			v.array(v.object({ content: v.string(), title: v.string() }))
		),
	}).index("by_day", ["day"]),

	sessions: defineTable({
		sessionCode: v.string(),
		gameState: v.string(), // "LOBBY" | "INSTRUCTIONS" | "DAY_TRANSITION" | "IN_GAME" | "DAY_RESULT" | "FINISHED"
		currentDay: v.number(), // 0..14
		currentSubPage: v.optional(v.number()), // For sub-pages like day 1.1, 1.2, etc.
		hostId: v.string(),
		layoutPreference: v.optional(v.string()), // "choices-top" | "status-top"
		transitionDuration: v.optional(v.number()), // Duration in milliseconds for day transitions (default: 1000)
		hideHits: v.optional(v.boolean()),
		groups: v.optional(
			v.array(
				v.object({
					id: v.string(),
					name: v.string(),
					color: v.string(),
				})
			)
		),
	}).index("by_code", ["sessionCode"]),

	players: defineTable({
		sessionId: v.id("sessions"),
		name: v.string(),
		resources: v.number(),
		familyHits: v.number(),
		healthHits: v.number(),
		jobHits: v.number(),
		isEmployed: v.boolean(),
		loanBalance: v.number(),
		borrowCount: v.number(),
		ringPawned: v.boolean(),
		groupId: v.optional(v.string()),
		choices: v.array(
			v.object({
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
			})
		),
	}).index("by_session", ["sessionId"]),
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	scenarios: defineTable({
		day: v.number(),
		prompt: v.string(),
		optionA_text: v.string(),
		optionB_text: v.string(),
		optionA_consequence: v.object({
			resourceChange: v.number(),
			narrative: v.string(),
			familyHits: v.optional(v.number()),
			healthHits: v.optional(v.number()),
			jobHits: v.optional(v.number()),
			removeFamilyHits: v.optional(v.number()),
		}),
		optionB_consequence: v.object({
			resourceChange: v.number(),
			narrative: v.string(),
			familyHits: v.optional(v.number()),
			healthHits: v.optional(v.number()),
			jobHits: v.optional(v.number()),
			removeFamilyHits: v.optional(v.number()),
		}),
	}).index("by_day", ["day"]),

	sessions: defineTable({
		sessionCode: v.string(),
		gameState: v.string(), // "LOBBY" | "IN_GAME" | "FINISHED"
		currentDay: v.number(), // 0..14
		hostId: v.string(),
		layoutPreference: v.optional(v.string()), // "choices-top" | "status-top"
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

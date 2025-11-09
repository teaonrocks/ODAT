// convex/scenarios.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// This query remains the same.
export const get = query({
	args: { day: v.number() },
	handler: async (ctx, { day }) => {
		const scenario = await ctx.db
			.query("scenarios")
			.withIndex("by_day", (q) => q.eq("day", day))
			.unique();
		return scenario ?? null;
	},
});

// This mutation now contains the real data from your slideshow.
export const seed = mutation({
	args: {},
	handler: async (ctx) => {
		// Define a more detailed type for our scenario data
		type Scenario = {
			day: number;
			prompt: string;
			optionA_text: string;
			optionB_text: string;
			optionA_details?: string[];
			optionB_details?: string[];
			optionA_consequence: {
				resourceChange: number;
				narrative: string;
				familyHits?: number;
				healthHits?: number;
				jobHits?: number;
				removeFamilyHits?: number;
			};
			optionB_consequence: {
				resourceChange: number;
				narrative: string;
				familyHits?: number;
				healthHits?: number;
				jobHits?: number;
			};
			subPages?: Array<{
				title: string;
				content: string;
			}>;
		};

		const scenarios: Scenario[] = [
			{
				day: 0,
				prompt:
					"You are a single parent with two school-going children, living in a one-room rental flat. You are unemployed with $150 left. Can you make it through the next two weeks?",
				optionA_text: "I'm ready to begin",
				optionB_text: "I'm ready to begin",
				optionA_consequence: {
					resourceChange: 0,
					narrative: "Take a deep breath. Your journey begins now.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative: "Take a deep breath. Your journey begins now.",
				},
				subPages: [
					{
						title: "Before You Begin",
						content:
							"Close your eyes, take a deep breath, and put on the hat of a single parent. Remember: every decision matters when resources are limited.",
					},
				],
			},
			{
				day: 1,
				prompt: "You have an interview for a new job.",
				optionA_text: "Take public transport to and fro",
				optionB_text: "Walk 1.5 hours to the interview and 1.5 hours back",
				optionA_consequence: {
					resourceChange: -6,
					narrative: "You arrived at the interview full of energy and on time.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"You saved money but arrived tired. Still, you got the job!",
				},
				subPages: [
					{
						title: "Congratulations!",
						content: "You got the job!",
					},
				],
			},
			{
				day: 2,
				prompt: "It's time to purchase groceries for the week.",
				optionA_text: "Less nutritious option (canned food, instant noodles)",
				optionB_text: "Nutritious option (fresh fruits, vegetables, meat)",
				optionA_details: [
					"Instant noodles",
					"Processed frozen meals",
					"White bread",
				],
				optionB_details: [
					"Fresh vegetables",
					"Wholegrain rice",
					"Healthy snacks",
				],
				optionA_consequence: {
					resourceChange: -70,
					narrative:
						"By choosing a less nutritious option, your family suffered the ill effects of an unhealthy diet.",
					familyHits: 1,
					healthHits: 1,
				},
				optionB_consequence: {
					resourceChange: -140,
					narrative:
						"It was expensive, but you provided healthy food for your family.",
				},
			},
			{
				day: 3,
				prompt:
					"It's your first day of work. You went to the MRT Station and realised that there's a train breakdown. You are running late.",
				optionA_text: "Take Grab at peak hours",
				optionB_text: "Take the bus but ended up late for work",
				optionA_consequence: {
					resourceChange: -30,
					narrative: "A costly ride, but you made it to work on time.",
				},
				optionB_consequence: {
					resourceChange: -3,
					narrative: "Being late on your first day left a bad impression.",
					jobHits: 1,
				},
			},
			{
				day: 4,
				prompt:
					"Your children need to buy assessment books and stationery supplies.",
				optionA_text: "Purchase only the necessary items",
				optionB_text:
					"Purchase additional supplies up to $100 to get a discount of 25%",
				optionB_details: [
					"Purchase supplies up to $100 to receive 25% discount.",
				],
				optionA_consequence: {
					resourceChange: -60,
					narrative: "You got the essentials, but missed out on the savings.",
				},
				optionB_consequence: {
					resourceChange: -75,
					narrative:
						"You spent more upfront but took advantage of bulk savings.",
				},
				subPages: [
					{
						title: "Limited Cashflow",
						content:
							"Low-income families are often unable to take advantage of savings from bulk purchase.",
					},
				],
			},
			{
				day: 5,
				prompt: "Utilities and rental bills are due.",
				optionA_text: "Pay bills",
				optionB_text: "Don't pay",
				optionB_details: [
					"Reduced gas, water, and electricity supplies + late payment charges for rent.",
				],
				optionA_consequence: {
					resourceChange: -120,
					narrative:
						"Your bills were paid, ensuring a steady supply of water, gas, and electricity.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"You faced utilities disruptions and extra charges for late rent payment.",
					familyHits: 2,
				},
			},
			{
				day: 6,
				prompt: "Your prepaid phone card is out of credit.",
				optionA_text: "Top up",
				optionB_text: "Be uncontactable at work",
				optionA_consequence: {
					resourceChange: -20,
					narrative: "You could be contacted for work and family emergencies.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"Your employer was furious with you for being uncontactable at work.",
					jobHits: 1,
				},
			},
			{
				day: 7,
				prompt: "You are running out of food at home.",
				optionA_text: "Buy additional groceries",
				optionB_text: "Skip your meals at home",
				optionA_consequence: {
					resourceChange: -50,
					narrative:
						"You bought more food to ensure your family didn't go hungry.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"Skipping meals took a toll on your health and well-being.",
					healthHits: 1,
				},
			},
			{
				day: 8,
				prompt: "PAYDAY after one week of work!",
				optionA_text: "Keep full salary",
				optionB_text:
					"Keep remaining salary after paying rent and utilities arrears of $130",

				optionA_consequence: {
					resourceChange: 300,
					narrative: "You received your weekly salary of $300.",
				},
				optionB_consequence: {
					// 300 salary - 130 arrears
					resourceChange: 170,
					narrative:
						"You received $300 and immediately paid $130 for overdue bills.",
				},
				subPages: [
					{
						title: "Loan & Ring",
						content:
							"You could choose to repay your loan. If you don't, you will receive one Health Hit.\n\nNo penalty for not redeeming your ring at this moment.",
					},
				],
			},
			{
				day: 9,
				prompt:
					"Your daughter is invited by her classmate to attend her birthday party.",
				optionA_text: "Bring a gift",
				optionB_text: "Ask her to decline invitation",
				optionA_consequence: {
					resourceChange: -20,
					narrative:
						"Your daughter got to celebrate with her friend, strengthening their friendship.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"Your daughter blamed you for losing friends after you told her to decline a birthday invitation.",
					familyHits: 1,
				},
				subPages: [
					{
						title: "Physical Needs Prioritised",
						content:
							"The 'need to belong' is often sacrificed to meet the more visible and immediate physical needs.",
					},
				],
			},
			{
				day: 10,
				prompt: "Your stove breaks down.",
				optionA_text: "Buy a new stove",
				optionB_text: "Eat out for a week and delay solving the stove issue",
				optionA_details: ["Purchase refurbished stove", "One-time repair cost"],
				optionB_details: [
					"3 take-away meals per day",
					"Family nutrition suffers",
				],
				optionA_consequence: {
					resourceChange: -120,
					narrative:
						"A large but necessary expense. You could now cook at home again.",
				},
				optionB_consequence: {
					resourceChange: -80,
					narrative:
						"You postponed addressing the broken stove by choosing to eat out, but the issue persisted.",
				},
				subPages: [
					{
						title: "No Savings",
						content:
							"Low-income families have little or no savings to meet huge unforeseen expenses.",
					},
				],
			},
			{
				day: 11,
				prompt:
					"Your daughter is in school and running a high fever. Her teacher called you.",
				optionA_text: "Ask for time-off; bring daughter to the polyclinic",
				optionB_text:
					"Leave her in the sick bay; bring her to a private clinic at night after work",
				optionA_consequence: {
					resourceChange: -20,
					narrative:
						"Taking time off to care for your daughter made her feel loved, but it upset your employer.",
					jobHits: 1,
					removeFamilyHits: 1,
				},
				optionB_consequence: {
					resourceChange: -60,
					narrative:
						"You avoided missing work, but your daughter felt neglected and the private clinic was more expensive.",
					familyHits: 2,
				},
			},
			{
				day: 12,
				prompt:
					"Owed Town Council 4 months of conservancy charges. You have been issued a notice to appear in court.",
				optionA_text: "Pay conservancy charges",
				optionB_text: "Contest in court; miss a day of work",
				optionA_consequence: {
					resourceChange: -100,
					narrative:
						"You settled the conservancy charges and avoided legal trouble.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"You missed a day of work to resolve your legal issues but it damaged your standing at work.",
					jobHits: 1,
				},
			},
			{
				day: 13,
				prompt:
					"Your son's team has been selected for an ASEAN competition in Bangkok. You need to co-pay his expenses.",
				optionA_text: "Pay for son's trip",
				optionB_text: "Do not give consent for the trip",
				optionA_consequence: {
					resourceChange: -150,
					narrative:
						"You've given your son an incredible opportunity, boosting his morale and future prospects.",
					removeFamilyHits: 1,
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"Your son missed out on a significant life experience, and he hated you for it.",
					familyHits: 2,
				},
			},
			{
				day: 14,
				prompt: "Second PAYDAY!",
				optionA_text: "Receive Salary",
				optionB_text: "Out-of-job",
				optionA_consequence: {
					resourceChange: 300,
					narrative: "You made it! You received your second pay cheque.",
				},
				optionB_consequence: {
					resourceChange: 0,
					narrative:
						"You were let go from your job and missed your second pay cheque.",
				},
				subPages: [
					{
						title: "End of two weeks",
						content:
							"You need to repay your loans and redeem your wedding ring.",
					},
					{
						title: "Reflection",
						content: "Do you think you can make it through another 14 days?",
					},
					{
						title: "Before we end...",
						content:
							"close your eyes, take a deep breath, and take off the hat of the single parent.",
					},
					{
						title: "Loan & Ring",
						content:
							"You must repay your outstanding loan and redeem your wedding ring. If you don't, you will receive one Health Hit.",
					},
				],
			},
		];

		for (const s of scenarios) {
			const existing = await ctx.db
				.query("scenarios")
				.withIndex("by_day", (q) => q.eq("day", s.day))
				.unique();
			if (existing) {
				// Use patch to update existing scenarios
				await ctx.db.patch(existing._id, s);
			} else {
				// Insert new ones if they don't exist
				await ctx.db.insert("scenarios", s);
			}
		}
		return true;
	},
});

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InstructionSlidesProps {
	currentSlide: number;
	totalSlides?: number;
}

interface InstructionSlide {
	title: string;
	content: string[];
	isDecisionExample?: boolean;
	isConsequenceExample?: boolean;
	isAccumulatedExample?: boolean;
}

const instructionSlides: InstructionSlide[] = [
	{
		title: "One Day at a Time",
		content: [
			"An experiential activity to build awareness of challenges faced by a low-income family",
		],
	},
	{
		title: "Your Role",
		content: ["You are a single parent with two school-going children."],
	},
	{
		title: "Your Housing",
		content: ["Your family lives in a one-room rental flat."],
	},
	{
		title: "Starting Situation",
		content: ["You are unemployed and have $150 left."],
	},
	{
		title: "The Challenge",
		content: [
			"Can you make it through the next two weeks (14 days)?",

			"Every decision matters when resources are limited.",
		],
	},
	{
		title: "Daily Decisions",
		content: [
			"You have to choose between two options each day.",
			"Example: Day 7 – You have a toothache.",
		],
		isDecisionExample: true,
	},
	{
		title: "Consequences of Choices",
		content: [
			"Your decision will lead to consequences.",
			"You might receive a Family Hit, a Health Hit, or a Job Hit.",
			"Example: Day 7 – You have a toothache.",
		],
		isConsequenceExample: true,
	},
	{
		title: "Accumulated Outcomes",
		content: ["The consequences will result in accumulated outcomes."],
		isAccumulatedExample: true,
	},
	{
		title: "Job Income",
		content: [
			"If you get a job, you will be paid by the week.",
			"If you get fired before payday, there will not be any pro-rated pay.",
		],
	},
	{
		title: "When short on cash",
		content: [
			"If funds are insufficient, you may:",
			"1. Borrow money (up to 3 times within 2 weeks)",
			"2. Pawn your gold wedding ring (from late spouse)",
			"3. Choose the more affordable option for that day",
		],
	},
	{
		title: "Repayment Terms",
		content: [
			"Loans: 10% interest",
			"Ring redemption: 6% interest",
			"All borrowed amounts must be repaid at the end of two weeks.",
			"The more you borrow, the more you will have to repay.",
		],
	},
	{
		title: "Before we start...",
		content: [
			"close your eyes,",
			"take a deep breath,",
			"and put on the hat of a single parent with two school-going children.",
		],
	},
	{
		title: "Let's take it one day at a time.",
		content: ["All the best!"],
	},
];

export default function InstructionSlides({
	currentSlide,
	totalSlides,
}: InstructionSlidesProps) {
	const totalAvailableSlides = instructionSlides.length;
	const safeIndex = Math.min(
		Math.max(currentSlide, 0),
		totalAvailableSlides - 1
	);
	const slide = instructionSlides[safeIndex];
	const totalToDisplay = Math.min(
		totalSlides ?? totalAvailableSlides,
		totalAvailableSlides
	);
	const currentNumber = safeIndex + 1;

	return (
		<main className="min-h-screen flex items-center justify-center bg-background p-8">
			<div className="w-full max-w-[1200px] space-y-12">
				{/* Instruction Content */}
				<Card className="bg-background/90">
					<CardHeader>
						<CardTitle className="text-4xl sm:text-5xl font-bold text-center">
							{slide.title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/40 rounded-3xl px-10 py-12">
							<div className="space-y-6 text-2xl sm:text-3xl leading-snug text-center">
								{slide.content.map((line, index) => {
									// Handle bold text formatting for slide 10
									if (line.includes("**other more affordable option**")) {
										const parts = line.split(
											"**other more affordable option**"
										);
										return (
											<p key={index} className="text-center">
												{parts[0]}
												<strong>other more affordable option</strong>
												{parts[1]}
											</p>
										);
									}
									return (
										<p key={index} className="text-center">
											{line}
										</p>
									);
								})}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Decision Example Visual (Slide 7) */}
				{slide.isDecisionExample && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
						{/* Option A - Blue */}
						<Card className="bg-blue-600 flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center gap-2"></CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-6 p-10">
								<p className="text-3xl sm:text-4xl leading-snug text-white text-center">
									Extract
								</p>
								<div className="flex justify-center">
									<div className="inline-flex items-center gap-3 bg-neutral-50 text-black px-6 py-3 rounded-full shadow-lg">
										<span className="text-3xl font-bold">$110</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Option B - Yellow */}
						<Card className="bg-yellow-600 flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center gap-2"></CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-6 p-10">
								<p className="text-3xl sm:text-4xl leading-snug text-white text-center">
									Ignore
								</p>
								<div className="flex justify-center">
									<div className="inline-flex items-center gap-3 bg-neutral-50 text-black px-6 py-3 rounded-full shadow-lg">
										<span className="text-3xl font-bold">$0</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Consequence Example Visual (Slide 8) */}
				{slide.isConsequenceExample && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
						{/* Health Hit Result */}
						<div className=" flex flex-col">
							<div className="flex-1 flex flex-col justify-center items-end space-y-4">
								<div className="flex items-center space-x-4">
									<span className="text-white font-bold text-4xl">
										Health Hit!
									</span>
									<div className="w-10 h-10 rounded-full bg-red-500"></div>
								</div>
							</div>
						</div>

						{/* Option B - Yellow (Ignore) - The chosen option */}
						<Card className="bg-yellow-600 flex flex-col border-8 border-green-400">
							<CardHeader>
								<CardTitle className="flex items-center gap-2"></CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-6 p-10">
								<p className="text-3xl sm:text-4xl leading-snug text-white text-center">
									Ignore
								</p>
								<div className="flex justify-center">
									<div className="inline-flex items-center gap-3 bg-neutral-50 text-black px-6 py-3 rounded-full shadow-lg">
										<span className="text-3xl font-bold">$0</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Accumulated Outcomes Visual (Slide 9) */}
				{slide.isAccumulatedExample && (
					<div className="space-y-10">
						{/* First progression: 3 Family Hits → +1 Health Hit */}
						<div className="flex items-center justify-center space-x-10 text-3xl">
							<div className="flex items-center space-x-4">
								<span className="text-white font-bold">3</span>
								<div className="w-8 h-8 rounded-full bg-blue-500"></div>
								<span className="text-white font-bold">Family Hits</span>
							</div>
							<span className="text-white text-4xl">→</span>
							<div className="flex items-center space-x-3">
								<span className="text-white font-bold">1 Health Hit</span>
								<div className="flex items-center space-x-1">
									<div className="w-8 h-8 rounded-full bg-blue-500 opacity-30"></div>
									<div className="w-8 h-8 rounded-full bg-blue-500 opacity-30"></div>
									<div className="w-8 h-8 rounded-full bg-blue-500 opacity-30"></div>
									<div> = </div>
									<div className="w-8 h-8 rounded-full bg-red-500"></div>
								</div>
							</div>
						</div>

						{/* Second progression: 3 Health Hits → +1 Job Hit */}
						<div className="flex items-center justify-center space-x-10 text-3xl">
							<div className="flex items-center space-x-4">
								<span className="text-white font-bold">3</span>
								<div className="w-8 h-8 rounded-full bg-red-500"></div>
								<span className="text-white font-bold">Health Hits</span>
							</div>
							<span className="text-white text-4xl">→</span>
							<div className="flex items-center space-x-3">
								<span className="text-white font-bold">1 Job Hit</span>
								<div className="flex items-center space-x-1">
									<div className="w-8 h-8 rounded-full bg-red-500 opacity-30"></div>
									<div className="w-8 h-8 rounded-full bg-red-500 opacity-30"></div>
									<div className="w-8 h-8 rounded-full bg-red-500 opacity-30"></div>
									<div> = </div>
									<div className="w-8 h-8 rounded-full bg-green-500"></div>
								</div>
							</div>
						</div>

						{/* Third progression: 3 Job Hits → Fired from Job */}
						<div className="flex items-center justify-center space-x-10 text-3xl">
							<div className="flex items-center space-x-4">
								<span className="text-white font-bold">3</span>
								<div className="w-8 h-8 rounded-full bg-green-500"></div>
								<span className="text-white font-bold">Job Hits</span>
							</div>
							<span className="text-white text-4xl">→</span>
							<span className="text-white font-bold">Fired from Job</span>
						</div>
					</div>
				)}

				<p className="text-xl text-muted-foreground text-center pt-4">
					Instruction {currentNumber} of {totalToDisplay}
				</p>
			</div>
		</main>
	);
}

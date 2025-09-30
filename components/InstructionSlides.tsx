"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InstructionSlidesProps {
	currentSlide: number;
	totalSlides: number;
}

interface InstructionSlide {
	title: string;
	content: string[];
	isDecisionExample?: boolean;
	isConsequenceExample?: boolean;
	isAccumulatedExample?: boolean;
}

const instructionSlides = [
	{
		title: "One Day at a Time",
		content: [
			"An experiential activity to build awareness of challenges faced by a low-income family.",
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
		content: ["You are unemployed and have $150 cash left."],
	},
	{
		title: "The Challenge",
		content: ["Can you make it through the next two weeks (14 days)?"],
	},
	{
		title: "Instructions for the Activity",
		content: [
			"Follow the daily decisions and see how your choices affect your family's survival.",
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
			"You might receive a Family Hit, a Health Hit or a Job Hit.",
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
		title: "When Short on Cash",
		content: [
			"If funds are insufficient, you may:",
			"1. Borrow money (max 3 times within 2 weeks)",
			"2. Pawn a gold wedding ring (from late spouse)",
			"3. Choose the other option for that day",
		],
	},
	{
		title: "Repayment Terms",
		content: [
			"Financial obligations:",
			"• Loans: 10% interest",
			"• Ring redemption: 6% interest",
			"• All borrowed amounts must be repaid at the end of two weeks",
			"• Borrowing more increases total repayment",
		],
	},
	{
		title: "Before We Start...",
		content: [
			"Remember this is about understanding real challenges.",
			"Make decisions thoughtfully.",
			"Consider the difficult trade-offs families face every day.",
		],
	},
	{
		title: "Let's Begin!",
		content: ["Let's take it one day at a time.", "All the best!"],
	},
];

export default function InstructionSlides({
	currentSlide,
	totalSlides,
}: InstructionSlidesProps) {
	const slide = instructionSlides[currentSlide] || instructionSlides[0];

	return (
		<main className="min-h-screen p-4 sm:p-8">
			<div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
				{/* Header */}
				<Card>
					<CardHeader>
						<div className="flex justify-center items-center">
							<CardTitle className="text-2xl font-bold">
								<p className="text-2xl font-bold">
									Instructions {currentSlide + 1} of {totalSlides}
								</p>
							</CardTitle>
						</div>
					</CardHeader>
				</Card>

				{/* Instruction Content */}
				<Card>
					<CardHeader>
						<CardTitle className="text-3xl sm:text-4xl font-bold text-center">
							{slide.title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 rounded-lg p-6 sm:p-8">
							<div className="space-y-4 text-lg sm:text-2xl leading-relaxed text-center">
								{slide.content.map((line, index) => (
									<p
										key={index}
										className={
											line.startsWith("•")
												? "text-left max-w-3xl mx-auto"
												: "text-center"
										}
									>
										{line}
									</p>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Decision Example Visual (Slide 7) */}
				{slide.isDecisionExample && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
						{/* Option A - Blue */}
						<Card className="bg-blue-600 flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center gap-2"></CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-4">
								<p className="text-base sm:text-2xl leading-relaxed text-black text-center">
									Extract
								</p>
								<div className="text-right">
									<div className="inline-block bg-neutral-50 text-white px-4 py-2 rounded-full">
										<span className="text-xl font-bold text-black">$110</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Option B - Yellow */}
						<Card className="bg-yellow-600 flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center gap-2"></CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-4">
								<p className="text-base sm:text-2xl leading-relaxed text-black text-center">
									Ignore
								</p>
								<div className="text-right">
									<div className="inline-block bg-neutral-50 text-black px-4 py-2 rounded-full">
										<span className="text-xl font-bold">$0</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Consequence Example Visual (Slide 8) */}
				{slide.isConsequenceExample && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
						{/* Health Hit Result */}
						<Card className="bg-gray-800 flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center justify-center">
									<span className="text-2xl font-bold text-white">Result</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-center items-center space-y-4">
								<div className="bg-red-500 text-white px-6 py-3 rounded-lg border-2 border-red-600">
									<span className="text-2xl font-bold">Health Hit! ●</span>
								</div>
							</CardContent>
						</Card>

						{/* Option B - Yellow (Ignore) - The chosen option */}
						<Card className="bg-yellow-600 flex flex-col border-4 border-green-400">
							<CardHeader>
								<CardTitle className="flex items-center gap-2"></CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-4">
								<p className="text-base sm:text-2xl leading-relaxed text-black text-center">
									Ignore
								</p>
								<div className="text-right">
									<div className="inline-block bg-neutral-50 text-black px-4 py-2 rounded-full">
										<span className="text-xl font-bold">$0</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Accumulated Outcomes Visual (Slide 9) */}
				{slide.isAccumulatedExample && (
					<div className="space-y-8">
						{/* First progression: 3 Family Hits → +1 Health Hit */}
						<div className="flex items-center justify-center space-x-6 text-2xl">
							<div className="flex items-center space-x-2">
								<span className="text-white font-bold">3</span>
								<div className="w-6 h-6 rounded-full bg-blue-500"></div>
								<span className="text-white font-bold">Family Hits</span>
							</div>
							<span className="text-white text-3xl">→</span>
							<div className="flex items-center space-x-2">
								<span className="text-white font-bold">+1 Health Hit</span>
								<div className="flex items-center space-x-1">
									<div className="w-6 h-6 rounded-full bg-blue-500 opacity-30"></div>
									<div className="w-6 h-6 rounded-full bg-blue-500 opacity-30"></div>
									<div className="w-6 h-6 rounded-full bg-blue-500 opacity-30"></div>
									<div className="w-6 h-6 rounded-full bg-red-500"></div>
								</div>
							</div>
						</div>

						{/* Second progression: 3 Health Hits → +1 Job Hit */}
						<div className="flex items-center justify-center space-x-6 text-2xl">
							<div className="flex items-center space-x-2">
								<span className="text-white font-bold">3</span>
								<div className="w-6 h-6 rounded-full bg-red-500"></div>
								<span className="text-white font-bold">Health Hits</span>
							</div>
							<span className="text-white text-3xl">→</span>
							<div className="flex items-center space-x-2">
								<span className="text-white font-bold">+1 Job Hit</span>
								<div className="flex items-center space-x-1">
									<div className="w-6 h-6 rounded-full bg-red-500 opacity-30"></div>
									<div className="w-6 h-6 rounded-full bg-red-500 opacity-30"></div>
									<div className="w-6 h-6 rounded-full bg-red-500 opacity-30"></div>
									<div className="w-6 h-6 rounded-full bg-green-500"></div>
								</div>
							</div>
						</div>

						{/* Third progression: 3 Job Hits → Fired from Job */}
						<div className="flex items-center justify-center space-x-6 text-2xl">
							<div className="flex items-center space-x-2">
								<span className="text-white font-bold">3</span>
								<div className="w-6 h-6 rounded-full bg-green-500"></div>
								<span className="text-white font-bold">Job Hits</span>
							</div>
							<span className="text-white text-3xl">→</span>
							<span className="text-white font-bold">Fired from Job</span>
						</div>

						{/* Additional info */}
						<div className="space-y-2 text-center text-lg text-white">
							<p>If you get a job, you will be paid by the week.</p>
							<p>
								If you get fired before payday, there will not be any pro-rated
								pay.
							</p>
						</div>
					</div>
				)}

				{/* Progress Indicator */}
				<Card>
					<CardContent className="py-6">
						<div className="flex justify-center space-x-2">
							{instructionSlides.map((_, index) => (
								<div
									key={index}
									className={`w-3 h-3 rounded-full ${
										index === currentSlide
											? "bg-blue-600"
											: index < currentSlide
												? "bg-blue-300"
												: "bg-gray-300"
									}`}
								/>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

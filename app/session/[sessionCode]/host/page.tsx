"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HostPage() {
	const { sessionCode } = useParams<{ sessionCode: string }>();
	const session = useQuery(api.sessions.getSessionByCode, { sessionCode });
	const scenario = useQuery(
		api.scenarios.get,
		session?.currentDay ? { day: session.currentDay } : "skip"
	);

	if (session === undefined) return null; // loading
	if (!session) {
		return (
			<main className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-xl">
					<CardContent className="text-center py-8">
						<p className="text-lg text-muted-foreground">Session not found.</p>
					</CardContent>
				</Card>
			</main>
		);
	}

	// Lobby slide
	if (session.gameState === "LOBBY") {
		return (
			<main className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-4xl text-center space-y-8">
					<Card>
						<CardHeader className="pb-8">
							<CardTitle className="text-4xl sm:text-6xl font-bold">
								One Day at a Time
							</CardTitle>
							<p className="text-xl sm:text-2xl text-muted-foreground mt-4">
								Financial Decision Game
							</p>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-xl sm:text-2xl">
								Session Code
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-4xl sm:text-6xl font-mono font-bold tracking-wider bg-muted/50 rounded-lg p-6">
								{session.sessionCode}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="py-6">
							<p className="text-lg text-muted-foreground">
								Waiting for players to join...
							</p>
						</CardContent>
					</Card>
				</div>
			</main>
		);
	}

	// Game finished slide
	if (session.gameState === "FINISHED") {
		return (
			<main className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-4xl text-center space-y-8">
					<Card>
						<CardHeader className="pb-8">
							<CardTitle className="text-4xl sm:text-6xl font-bold">
								Game Complete!
							</CardTitle>
							<p className="text-xl sm:text-2xl text-muted-foreground mt-4">
								Great job everyone!
							</p>
						</CardHeader>
					</Card>

					<Card>
						<CardContent className="py-6">
							<p className="text-lg text-muted-foreground">
								Check your individual results to see how you did.
							</p>
						</CardContent>
					</Card>
				</div>
			</main>
		);
	}

	// Main game slide - scenario presentation
	if (session.gameState === "IN_GAME" && scenario) {
		return (
			<main className="min-h-screen p-4 sm:p-8">
				<div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
					{/* Header */}
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<CardTitle className="text-2xl font-bold">
									One Day at a Time
								</CardTitle>
								<div className="text-right">
									<p className="text-sm text-muted-foreground">
										Session: {session.sessionCode}
									</p>
									<p className="text-2xl font-bold">Day {session.currentDay}</p>
								</div>
							</div>
						</CardHeader>
					</Card>

					{/* Scenario Prompt */}
					<Card>
						<CardContent>
							<div className="bg-muted/50 rounded-lg p-6 sm:p-8">
								<p className="text-lg sm:text-2xl leading-relaxed text-center">
									{scenario.prompt}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Options */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Option A - Blue */}
						<Card className="border-blue-500 ">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span className="bg-blue-600 text-white px-3 py-1 rounded-full text-lg font-bold">
										Option A
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-base sm:text-lg leading-relaxed">
									{scenario.optionA_text}
								</p>
								<div className="text-right">
									<div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full">
										<span className="text-xl font-bold">
											$
											{Math.abs(
												scenario.optionA_consequence.resourceChange || 0
											)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Option B - Yellow */}
						<Card className="border-yellow-500">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-lg font-bold">
										Option B
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-base sm:text-lg leading-relaxed">
									{scenario.optionB_text}
								</p>
								<div className="text-right">
									<div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full">
										<span className="text-xl font-bold">
											$
											{Math.abs(
												scenario.optionB_consequence.resourceChange || 0
											)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Instructions */}
					<Card>
						<CardContent className="text-center py-6">
							<p className="text-base sm:text-lg text-muted-foreground">
								Players: Choose your option using the blue or yellow buttons
							</p>
							<div className="mt-4">
								<a
									href={`/session/${sessionCode}/host/controls`}
									className="text-sm text-muted-foreground hover:text-foreground underline"
									target="_blank"
								>
									Open Presenter Controls →
								</a>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		);
	}

	// Fallback
	return (
		<main className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-xl">
				<CardContent className="text-center py-8">
					<p className="text-lg text-muted-foreground">Loading...</p>
				</CardContent>
			</Card>
		</main>
	);
}

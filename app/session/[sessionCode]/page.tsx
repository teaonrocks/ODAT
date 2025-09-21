"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerStatus } from "@/components/PlayerStatus";

// Component for displaying game options and choices
function GameOptions({
	session,
	scenario,
	player,
	playerId,
	makeChoice,
	setMessage,
}: {
	session: any;
	scenario: any;
	player: any;
	playerId: string | null;
	makeChoice: any;
	setMessage: (message: string | null) => void;
}) {
	// Check if it's Day 14 and player is unemployed
	const isDay14 = session.currentDay === 14;
	const salaryDisabled = isDay14 && !player.isEmployed;

	// Check Day 5 choice for Day 8 restrictions
	const isDay8 = session.currentDay === 8;
	const day5Choice = (player.choices ?? []).find(
		(choice: any) => choice.day === 5
	);
	const day5OptionADisabled = isDay8 && day5Choice?.choice === "A"; // If chose A on day 5, disable B on day 8
	const day5OptionBDisabled = isDay8 && day5Choice?.choice === "B"; // If chose B on day 5, disable A on day 8

	// Check Day 14 job hits restrictions
	const hasThreeJobHits = (player.jobHits || 0) >= 3;
	const day14OptionADisabled = isDay14 && hasThreeJobHits; // If has 3+ job hits, disable Option A
	const day14OptionBDisabled = isDay14 && !hasThreeJobHits; // If has <3 job hits, disable Option B

	// Check affordability for each option
	const canAffordOptionA =
		player.resources + (scenario.optionA_consequence.resourceChange || 0) >= 0;
	const canAffordOptionB =
		player.resources + (scenario.optionB_consequence.resourceChange || 0) >= 0;

	// Check if player has already made a choice for the current day
	const hasChosenToday = (player.choices ?? []).some(
		(choice: any) => choice.day === session.currentDay
	);

	// Get the choice made today (if any) to show the result
	const todaysChoice = (player.choices ?? []).find(
		(choice: any) => choice.day === session.currentDay
	);

	return (
		<Card className="w-full">
			<CardHeader className="pb-3 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl text-center">
					Day {session.currentDay}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 sm:space-y-4">
				<p className="text-center text-muted-foreground text-sm sm:text-base">
					Choose your option. The host will show you the details.
				</p>

				{hasChosenToday ? (
					<div className="space-y-3 sm:space-y-4">
						<div className="p-3 sm:p-4 bg-muted/50 border border-border rounded-lg">
							<h3 className="font-medium text-foreground mb-2 text-sm sm:text-base">
								Your Choice:
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{todaysChoice?.choice === "A" ? "Option A" : "Option B"} - $
								{Math.abs(todaysChoice?.consequence.resourceChange || 0)}
							</p>
						</div>
						<div className="p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg">
							<h3 className="font-medium text-foreground mb-2 text-sm sm:text-base">
								Result:
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{todaysChoice?.consequence.narrative}
							</p>
						</div>
						<p className="text-center text-muted-foreground text-xs sm:text-sm px-2">
							Waiting for the host to advance to the next day...
						</p>
					</div>
				) : (
					<div className="space-y-4 sm:space-y-6">
						<div className="grid grid-cols-2 gap-3 sm:gap-4">
							{/* Option A - Blue */}
							<div className="space-y-2">
								<Button
									onClick={async () => {
										if (!playerId) return;
										try {
											const result = await makeChoice({
												playerId: playerId as any,
												day: session.currentDay,
												choice: "A",
												consequence: scenario.optionA_consequence,
											});
											setMessage(
												scenario.optionA_consequence.narrative +
													` (Resources: $${result.resources})`
											);
										} catch (error) {
											setMessage(
												error instanceof Error
													? error.message
													: "An error occurred"
											);
										}
									}}
									disabled={
										(salaryDisabled &&
											scenario.optionA_text.toLowerCase().includes("salary")) ||
										!canAffordOptionA ||
										day5OptionBDisabled ||
										day14OptionADisabled
									}
									className={`w-full h-20 sm:h-24 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg sm:text-xl ${!canAffordOptionA || day5OptionBDisabled || day14OptionADisabled ? "opacity-50" : ""}`}
								>
									${Math.abs(scenario.optionA_consequence.resourceChange || 0)}
								</Button>
								{(!canAffordOptionA ||
									day5OptionBDisabled ||
									day14OptionADisabled) && (
									<p className="text-xs text-red-600 text-center px-1">
										{!canAffordOptionA
											? "💰 Not enough money!"
											: "🚫 Option not available"}
									</p>
								)}
							</div>

							{/* Option B - Yellow */}
							<div className="space-y-2">
								<Button
									onClick={async () => {
										if (!playerId) return;
										try {
											const result = await makeChoice({
												playerId: playerId as any,
												day: session.currentDay,
												choice: "B",
												consequence: scenario.optionB_consequence,
											});
											setMessage(
												scenario.optionB_consequence.narrative +
													` (Resources: $${result.resources})`
											);
										} catch (error) {
											setMessage(
												error instanceof Error
													? error.message
													: "An error occurred"
											);
										}
									}}
									disabled={
										(salaryDisabled &&
											scenario.optionB_text.toLowerCase().includes("salary")) ||
										!canAffordOptionB ||
										day5OptionADisabled ||
										day14OptionBDisabled
									}
									className={`w-full h-20 sm:h-24 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg sm:text-xl ${!canAffordOptionB || day5OptionADisabled || day14OptionBDisabled ? "opacity-50" : ""}`}
								>
									${Math.abs(scenario.optionB_consequence.resourceChange || 0)}
								</Button>
								{(!canAffordOptionB ||
									day5OptionADisabled ||
									day14OptionBDisabled) && (
									<p className="text-xs text-red-600 text-center px-1">
										{!canAffordOptionB
											? "💰 Not enough money!"
											: "🚫 Option not available"}
									</p>
								)}
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Component for displaying player status section
function PlayerStatusSection({ player }: { player: any }) {
	return (
		<div>
			<PlayerStatus player={player as any} />
		</div>
	);
}

export default function PlayerPage() {
	const { sessionCode } = useParams<{ sessionCode: string }>();
	const router = useRouter();
	const session = useQuery(api.sessions.getSessionByCode, { sessionCode });
	const scenario = useQuery(
		api.scenarios.get,
		session?.currentDay ? { day: session.currentDay } : "skip"
	);
	const makeChoice = useMutation(api.players.makeChoice);
	const [message, setMessage] = useState<string | null>(null);

	const playerId = useMemo(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("odat_player_id");
	}, []);

	const player = useQuery(
		api.players.getById,
		playerId ? { playerId: playerId as any } : "skip"
	);

	useEffect(() => {
		if (session?.gameState === "FINISHED") {
			router.replace(`/session/${sessionCode}/results`);
		}
	}, [session, router, sessionCode]);

	if (session === undefined) return null; // loading
	if (!session) return <div className="p-6">Session not found.</div>;

	if (session.gameState === "LOBBY") {
		return (
			<main className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-xl">
					<CardHeader className="pb-3 sm:pb-6">
						<CardTitle className="text-lg sm:text-xl text-center">
							Lobby — Code: {session.sessionCode}
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center py-6 sm:py-8">
						<p className="text-base sm:text-lg text-muted-foreground">
							Waiting for host to start…
						</p>
					</CardContent>
				</Card>
			</main>
		);
	}

	if (session.gameState === "IN_GAME") {
		if (!scenario || !player) return <div className="p-6">Loading…</div>;

		return (
			<main className="min-h-screen p-2 sm:p-4 space-y-2 sm:space-y-4">
				<div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-4">
					{/* Player Status - Top on all screen sizes */}
					<PlayerStatusSection player={player} />

					{/* Game Content - Bottom on all screen sizes */}
					<div>
						<GameOptions
							session={session}
							scenario={scenario}
							player={player}
							playerId={playerId}
							makeChoice={makeChoice}
							setMessage={setMessage}
						/>

						{message && (
							<div className="mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
								{message}
							</div>
						)}
					</div>
				</div>
			</main>
		);
	}

	return null;
}

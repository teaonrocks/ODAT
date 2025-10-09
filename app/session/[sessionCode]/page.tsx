"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerStatus } from "@/components/PlayerStatus";
import DayTransition from "@/components/DayTransition";
import DayResult from "@/components/DayResult";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Session = Doc<"sessions">;
type Player = Doc<"players">;
type Scenario = Doc<"scenarios">;
type Choice = Player["choices"][0];
type MakeChoiceMutation = ReturnType<
	typeof useMutation<typeof api.players.makeChoice>
>;
type RepayLoanMutation = ReturnType<
	typeof useMutation<typeof api.players.repayLoan>
>;

// Component for displaying game options and choices
function GameOptions({
	session,
	scenario,
	player,
	playerId,
	makeChoice,
}: {
	session: Session;
	scenario: Scenario;
	player: Player;
	playerId: string | null;
	makeChoice: MakeChoiceMutation;
}) {
	// Check if it's Day 14 and player is unemployed
	const isDay14 = session.currentDay === 14;
	const salaryDisabled = isDay14 && !player.isEmployed;

	// Check Day 5 choice for Day 8 restrictions
	const isDay8 = session.currentDay === 8;
	const day5Choice = (player.choices ?? []).find(
		(choice: Choice) => choice.day === 5
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
		(choice: Choice) => choice.day === session.currentDay
	);

	// Get the choice made today (if any) to show the result
	return (
		<Card className="w-full">
			<CardHeader className="pb-3 sm:pb-6">
				<CardTitle className="text-lg sm:text-xl text-center">
					Day {session.currentDay}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 sm:space-y-4">
				{hasChosenToday ? (
					<div className="space-y-3 sm:space-y-4">
						<div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex justify-center items-center">
							<h3 className="font-medium text-green-800 mb-2 text-sm sm:text-base ">
								✓ Choice Submitted
							</h3>
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
											await makeChoice({
												playerId: playerId as Id<"players">,
												day: session.currentDay,
												choice: "A",
												consequence: scenario.optionA_consequence,
											});
										} catch (error) {
											// Error handling could be added here if needed
											console.error("Failed to make choice:", error);
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
											await makeChoice({
												playerId: playerId as Id<"players">,
												day: session.currentDay,
												choice: "B",
												consequence: scenario.optionB_consequence,
											});
										} catch (error) {
											// Error handling could be added here if needed
											console.error("Failed to make choice:", error);
										}
									}}
									disabled={
										(salaryDisabled &&
											scenario.optionB_text.toLowerCase().includes("salary")) ||
										!canAffordOptionB ||
										day5OptionADisabled ||
										day14OptionBDisabled
									}
									className={`w-full h-20 sm:h-24 bg-yellow-600 hover:bg-yellow-600 text-white font-bold text-lg sm:text-xl ${!canAffordOptionB || day5OptionADisabled || day14OptionBDisabled ? "opacity-50" : ""}`}
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

function Day8LoanReminder({
	subPage,
	player,
	repayLoan,
}: {
	subPage: { title: string; content: string };
	player: Player;
	repayLoan: RepayLoanMutation;
}) {
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const loanBalance = player.loanBalance ?? 0;
	const totalCost = Math.round(loanBalance * 1.1);
	const hasLoan = loanBalance > 0;
	const canRepay = hasLoan && (player.resources ?? 0) >= totalCost;

	const handleRepay = async () => {
		if (!hasLoan || !canRepay) return;
		setIsSubmitting(true);
		setStatusMessage(null);
		try {
			await repayLoan({
				playerId: player._id,
				repaymentAmount: loanBalance,
			});
			setStatusMessage(
				`Loan repayment submitted! You paid $${loanBalance} plus 10% interest.`
			);
		} catch (error) {
			setStatusMessage(
				error instanceof Error
					? error.message
					: "Failed to repay loan. Please try again."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleIgnore = () => {
		setStatusMessage("You chose to ignore the loan for now.");
	};

	return (
		<main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
			<div className="w-full max-w-4xl space-y-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-3xl sm:text-4xl font-bold text-center">
							{subPage.title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 rounded-lg p-6 sm:p-8">
							<p className="text-lg sm:text-2xl leading-relaxed text-center text-muted-foreground whitespace-pre-line">
								{subPage.content}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="space-y-6 p-6 sm:p-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg sm:text-xl text-center">
							<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
								<div className="font-semibold text-blue-900">Cash Available</div>
								<div className="text-3xl font-bold text-blue-900">
									${player.resources ?? 0}
								</div>
							</div>
							<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
								<div className="font-semibold text-amber-900">Loan Balance</div>
								<div className="text-3xl font-bold text-amber-900">
									${loanBalance}
								</div>
								{hasLoan && (
									<div className="mt-2 text-sm text-amber-800">
										Cost with 10% interest: ${totalCost}
									</div>
								)}
							</div>
						</div>

						{hasLoan ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Button
									onClick={handleRepay}
									disabled={!canRepay || isSubmitting}
									className="h-auto py-4 flex flex-col gap-1 text-base"
								>
									<span>Repay Loan (${loanBalance})</span>
									<span className="text-xs opacity-80">
										Includes 10% interest: ${totalCost}
									</span>
								</Button>
								<Button
									variant="outline"
									onClick={handleIgnore}
									disabled={isSubmitting}
									className="h-auto py-4 text-base"
								>
									Ignore For Now
								</Button>
							</div>
						) : (
							<div className="text-center text-sm sm:text-base text-muted-foreground">
								You have no outstanding loans. Let the host know when you&rsquo;re ready to
								continue.
							</div>
						)}

						{statusMessage && (
							<div className="text-sm text-center text-muted-foreground">
								{statusMessage}
							</div>
						)}
						{!canRepay && hasLoan && (
							<div className="text-sm text-center text-red-600">
								You need ${totalCost} to repay the loan but currently have $
								{player.resources ?? 0}.
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

// Component for displaying player status section
function PlayerStatusSection({
	player,
	showHits = true,
}: {
	player: Player;
	showHits?: boolean;
}) {
	return (
		<div>
			<PlayerStatus player={player} showHits={showHits} />
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
	const assignToGroup = useMutation(api.players.assignToGroup);
	const repayLoanMutation = useMutation(api.players.repayLoan);

	const playerId = useMemo(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("odat_player_id");
	}, []);

	const player = useQuery(
		api.players.getById,
		playerId ? { playerId: playerId as Id<"players"> } : "skip"
	);

	// Handle group selection
	const handleGroupSelection = async (groupId: string) => {
		if (!playerId) return;
		try {
			await assignToGroup({
				playerId: playerId as Id<"players">,
				groupId: groupId === "no-group" ? undefined : groupId,
			});
		} catch (error) {
			console.error("Failed to assign to group:", error);
		}
	};

	useEffect(() => {
		if (session?.gameState === "FINISHED" && playerId) {
			router.replace(`/session/${sessionCode}/results?playerId=${playerId}`);
		}
	}, [session, router, sessionCode, playerId]);

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
					<CardContent className="space-y-6">
						{player && (
							<div className="text-center">
								<p className="text-base text-muted-foreground mb-4">
									Welcome, <span className="font-medium">{player.name}</span>!
								</p>

								{/* Group Selection */}
								{session.groups && session.groups.length > 0 && (
									<div className="space-y-4">
										<div className="text-sm font-medium text-left">
											Choose your group:
										</div>
										<Select
											value={player.groupId || "no-group"}
											onValueChange={handleGroupSelection}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a group..." />
											</SelectTrigger>
											<SelectContent>
												{session.groups.map((group) => (
													<SelectItem key={group.id} value={group.id}>
														<div className="flex items-center gap-2">
															<div
																className="w-3 h-3 rounded-full"
																style={{ backgroundColor: group.color }}
															></div>
															<span>{group.name}</span>
														</div>
													</SelectItem>
												))}
												<SelectItem value="no-group">
													<span className="text-muted-foreground">
														No group
													</span>
												</SelectItem>
											</SelectContent>
										</Select>{" "}
										{player.groupId && (
											<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
												<div
													className="w-3 h-3 rounded-full"
													style={{
														backgroundColor:
															session.groups?.find(
																(g) => g.id === player.groupId
															)?.color || "#gray",
													}}
												></div>
												<span>
													You&apos;re in:{" "}
													{
														session.groups?.find((g) => g.id === player.groupId)
															?.name
													}
												</span>
											</div>
										)}
									</div>
								)}
							</div>
						)}

						<div className="text-center py-4">
							<p className="text-base sm:text-lg text-muted-foreground">
								Waiting for host to start…
							</p>
						</div>
					</CardContent>
				</Card>
			</main>
		);
	}

	if (session.gameState === "INSTRUCTIONS") {
		return (
			<main className="min-h-screen flex items-center justify-center p-4">
				<Card className="w-full max-w-xl">
					<CardContent className="flex flex-col items-center justify-center py-16 space-y-8">
						{/* Main Title */}
						<div className="text-center space-y-4">
							<h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
								One Day
							</h1>
							<h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
								at a Time
							</h1>
						</div>

						{/* Subtitle */}
						<div className="text-center space-y-2">
							<p className="text-lg text-muted-foreground">
								Instructions in progress
							</p>
							<p className="text-sm text-muted-foreground">
								Please listen to your facilitator
							</p>
						</div>

						{/* Player name if available */}
						{player && (
							<div className="text-center">
								<p className="text-sm text-muted-foreground">
									Welcome, <span className="font-medium">{player.name}</span>
								</p>
								{player.groupId &&
									session.groups?.find((g) => g.id === player.groupId) && (
										<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{
													backgroundColor:
														session.groups?.find((g) => g.id === player.groupId)
															?.color || "#gray",
												}}
											></div>
											<span>
												{
													session.groups?.find((g) => g.id === player.groupId)
														?.name
												}
											</span>
										</div>
									)}
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		);
	}

	if (session.gameState === "DAY_TRANSITION") {
		return <DayTransition day={session.currentDay ?? 1} />;
	}

	if (session.gameState === "DAY_RESULT" && scenario?.subPages) {
		const currentSubPage = session.currentSubPage ?? 0;
		const subPage = scenario.subPages[currentSubPage];

		if (subPage) {
			if (session.currentDay === 8 && player) {
				return (
					<Day8LoanReminder
						player={player}
						subPage={subPage}
						repayLoan={repayLoanMutation}
					/>
				);
			}
			return <DayResult title={subPage.title} content={subPage.content} />;
		}
	}

	if (session.gameState === "IN_GAME") {
		if (!scenario || !player) {
			return (
				<main className="min-h-screen p-2 sm:p-4 space-y-2 sm:space-y-4">
					<div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-4">
						{/* Loading State */}
						<Card className="w-full">
							<CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-6">
								{/* Animated loading spinner */}
								<div className="relative">
									<div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
								</div>

								{/* Loading text */}
								<div className="text-center space-y-2">
									<h3 className="text-lg sm:text-xl font-semibold text-foreground">
										Loading Day {session.currentDay}
									</h3>
									<p className="text-sm sm:text-base text-muted-foreground">
										Preparing your scenario...
									</p>
								</div>

								{/* Session info */}
								<div className="text-xs text-muted-foreground">
									Session: {session.sessionCode}
								</div>
							</CardContent>
						</Card>
					</div>
				</main>
			);
		}

		return (
			<main className="min-h-screen p-2 sm:p-4 space-y-2 sm:space-y-4">
				<div className="max-w-4xl mx-auto flex flex-col gap-2 sm:gap-4">
					<PlayerStatusSection player={player} showHits={!session.hideHits} />
					<GameOptions
						session={session}
						scenario={scenario}
						player={player}
						playerId={playerId}
						makeChoice={makeChoice}
					/>
				</div>
			</main>
		);
	}

	return null;
}

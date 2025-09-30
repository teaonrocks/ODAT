"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Footer } from "@/components/Footer";

export default function PresenterControlsPage() {
	const { sessionCode } = useParams<{ sessionCode: string }>();
	const router = useRouter();
	const session = useQuery(api.sessions.getSessionByCode, { sessionCode });
	const players = useQuery(
		api.players.getForSession,
		session?._id ? { sessionId: session._id } : "skip"
	);

	const startInstructions = useMutation(api.sessions.startInstructions);
	const startGame = useMutation(api.sessions.startGame);
	const nextDay = useMutation(api.sessions.advanceDay);
	const nextInstruction = useMutation(api.sessions.nextInstruction);
	const prevInstruction = useMutation(api.sessions.prevInstruction);
	const showDayScenario = useMutation(api.sessions.showDayScenario);
	const toggleLayout = useMutation(api.sessions.toggleLayoutPreference);
	const setTransitionDuration = useMutation(api.sessions.setTransitionDuration);

	const [durationInput, setDurationInput] = useState("");
	const [isTransitionSettingsOpen, setIsTransitionSettingsOpen] =
		useState(false);

	useEffect(() => {
		if (session?.gameState === "IN_GAME") {
			// optional: keep host here; players use different page
		}
	}, [session]);

	const canStart = useMemo(() => (players?.length ?? 0) > 0, [players]);

	if (session === undefined) return null; // loading
	if (!session) return <div className="p-6">Session not found.</div>;

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 p-4">
				<div className="max-w-6xl mx-auto space-y-6">
					{/* Header */}
					<Card>
						<CardHeader>
							<CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<span>Presenter Controls — Code: {session.sessionCode}</span>
								<div className="flex flex-wrap gap-2">
									<Button
										variant="outline"
										onClick={() =>
											window.open(`/session/${sessionCode}/host`, "_blank")
										}
									>
										📺 View Presentation
									</Button>
									<Button
										variant="outline"
										onClick={() => router.push(`/session/${sessionCode}`)}
									>
										👤 View Player View
									</Button>
								</div>
							</CardTitle>
						</CardHeader>
					</Card>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Game Controls */}
						<Card>
							<CardHeader>
								<CardTitle>Game Flow Controls</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="p-3 bg-muted/50 rounded-lg">
									<div className="text-sm text-muted-foreground mb-1">
										Current Status
									</div>
									<div className="text-lg font-medium">{session.gameState}</div>
									<div className="text-sm text-muted-foreground">
										Day {session.currentDay}
									</div>
								</div>

								{session.gameState === "LOBBY" && (
									<div className="space-y-3">
										<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
											<div className="text-sm font-medium text-yellow-800">
												Ready to Start
											</div>
											<div className="text-xs text-yellow-600">
												{players?.length || 0} player(s) connected
											</div>
										</div>
										<Button
											disabled={!canStart}
											onClick={async () => {
												if (!session?._id) return;
												await startInstructions({ sessionId: session._id });
											}}
											className="w-full"
											size="lg"
										>
											🎓 Start Instructions
										</Button>
									</div>
								)}

								{session.gameState === "INSTRUCTIONS" && (
									<div className="space-y-3">
										<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
											<div className="text-sm font-medium text-blue-800">
												Instructions in Progress
											</div>
											<div className="text-xs text-blue-600">
												Slide {(session.currentDay ?? 0) + 1} of 13
											</div>
										</div>
										<div className="flex gap-2">
											<Button
												disabled={(session.currentDay ?? 0) === 0}
												onClick={async () => {
													if (!session?._id) return;
													await prevInstruction({ sessionId: session._id });
												}}
												variant="outline"
												className="flex-1"
											>
												⬅️ Previous
											</Button>
											<Button
												onClick={async () => {
													if (!session?._id) return;
													if ((session.currentDay ?? 0) >= 12) {
														await startGame({ sessionId: session._id });
													} else {
														await nextInstruction({ sessionId: session._id });
													}
												}}
												className="flex-1"
											>
												{(session.currentDay ?? 0) >= 12
													? "🚀 Start Game"
													: "➡️ Next"}
											</Button>
										</div>
									</div>
								)}

								{session.gameState === "DAY_TRANSITION" && (
									<div className="space-y-3">
										<div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
											<div className="text-sm font-medium text-gray-800">
												Day Transition
											</div>
											<div className="text-xs text-gray-600">
												Showing &quot;Day {session.currentDay}&quot; for{" "}
												{(session.transitionDuration ?? 3000) / 1000} seconds
											</div>
										</div>
										<Button
											onClick={async () => {
												if (!session?._id) return;
												await showDayScenario({ sessionId: session._id });
											}}
											className="w-full"
											size="lg"
											variant="outline"
										>
											⏭️ Skip to Scenario
										</Button>
									</div>
								)}

								{session.gameState === "IN_GAME" && (
									<div className="space-y-3">
										<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
											<div className="text-sm font-medium text-green-800">
												Game In Progress
											</div>
											<div className="text-xs text-green-600">
												Day {session.currentDay} - Present scenario and advance
												when ready
											</div>
										</div>

										{/* Player Choice Counter */}
										<div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
											<div className="text-center space-y-2">
												<div className="text-sm font-medium text-gray-800">
													Player Choices
												</div>
												<div className="text-3xl font-bold text-gray-900">
													{players?.filter((p) =>
														p.choices?.some((c) => c.day === session.currentDay)
													).length || 0}
													<span className="text-lg text-gray-600">
														/{players?.length || 0}
													</span>
												</div>
												<div className="text-xs text-gray-600">
													players have made their choice
												</div>
												{/* Progress Bar */}
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-gray-800 h-2 rounded-full transition-all duration-300"
														style={{
															width: `${
																players?.length
																	? (players.filter((p) =>
																			p.choices?.some(
																				(c) => c.day === session.currentDay
																			)
																		).length /
																			players.length) *
																		100
																	: 0
															}%`,
														}}
													></div>
												</div>
											</div>
										</div>

										<Button
											onClick={async () => {
												if (!session?._id) return;
												await nextDay({ sessionId: session._id });
											}}
											className="w-full"
											size="lg"
										>
											⏭️ Next Day
										</Button>
									</div>
								)}

								{session.gameState === "FINISHED" && (
									<div className="space-y-3">
										<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
											<div className="text-sm font-medium text-blue-800">
												Game Complete
											</div>
											<div className="text-xs text-blue-600">
												Ready to view final results
											</div>
										</div>
										<Button
											onClick={() =>
												router.push(`/session/${session.sessionCode}/results`)
											}
											className="w-full"
											size="lg"
										>
											📊 View Results
										</Button>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Player Status Overview */}
						<Card>
							<CardHeader>
								<CardTitle>
									Player Status ({players?.length ?? 0} connected)
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3 max-h-96 overflow-y-auto">
									{players?.map((p) => (
										<div
											key={p._id}
											className="p-3 border border-border rounded-lg bg-muted/20"
										>
											<div className="flex justify-between items-start mb-2">
												<div className="font-medium">{p.name}</div>
												<div className="flex items-center gap-2">
													{session.gameState === "IN_GAME" && (
														<div
															className={`text-xs px-2 py-1 rounded-full font-medium ${
																p.choices?.some(
																	(c) => c.day === session.currentDay
																)
																	? "bg-green-100 text-green-800 border border-green-200"
																	: "bg-yellow-100 text-yellow-800 border border-yellow-200"
															}`}
														>
															{p.choices?.some(
																(c) => c.day === session.currentDay
															)
																? "✓ Chosen"
																: "⏳ Waiting"}
														</div>
													)}
													<div
														className={`text-xs px-2 py-1 rounded-full ${
															p.isEmployed
																? "bg-green-100 text-green-800 border border-green-200"
																: "bg-red-100 text-red-800 border border-red-200"
														}`}
													>
														{p.isEmployed ? "Employed" : "Unemployed"}
													</div>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-muted-foreground">Cash:</span>
													<span className="font-medium ml-1">
														${p.resources}
													</span>
												</div>
												<div>
													<span className="text-muted-foreground">Loan:</span>
													<span className="font-medium ml-1">
														${p.loanBalance || 0}
													</span>
												</div>
											</div>

											<div className="mt-2 flex gap-4 text-xs text-muted-foreground">
												<span>Family: {p.familyHits || 0}</span>
												<span>Health: {p.healthHits || 0}</span>
												<span>Job: {p.jobHits || 0}</span>
											</div>
										</div>
									))}

									{(!players || players.length === 0) && (
										<div className="text-center py-8 text-muted-foreground">
											<div className="text-4xl mb-2">👥</div>
											<div className="text-sm">No players connected yet</div>
											<div className="text-xs">
												Share code: <strong>{session.sessionCode}</strong>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-3">
								<Button
									variant="outline"
									onClick={() =>
										window.open(`/session/${sessionCode}/host`, "_blank")
									}
								>
									🖥️ Open Presentation (New Tab)
								</Button>
								<Button
									variant="outline"
									onClick={() =>
										navigator.clipboard.writeText(session.sessionCode)
									}
								>
									📋 Copy Session Code
								</Button>
								<Button
									variant="outline"
									onClick={() =>
										navigator.clipboard.writeText(
											window.location.origin + `/session/${sessionCode}`
										)
									}
								>
									🔗 Copy Player Link
								</Button>
								<Button
									variant="outline"
									onClick={async () => {
										if (!session?._id) return;
										await toggleLayout({ sessionId: session._id });
									}}
								>
									🔄 Toggle Layout (
									{session.layoutPreference === "status-top"
										? "Status Top"
										: "Choices Top"}
									)
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Transition Settings */}
					<Card>
						<Collapsible
							open={isTransitionSettingsOpen}
							onOpenChange={setIsTransitionSettingsOpen}
						>
							<CardHeader className="pb-3">
								<CollapsibleTrigger asChild>
									<div className="flex items-center justify-between cursor-pointer">
										<div>
											<CardTitle>Transition Settings</CardTitle>
											<div className="text-sm text-muted-foreground">
												Current: {(session.transitionDuration ?? 3000) / 1000}{" "}
												seconds
											</div>
										</div>
										<Button variant="ghost" size="sm" className="p-1 h-8 w-8">
											{isTransitionSettingsOpen ? "▼" : "▶"}
										</Button>
									</div>
								</CollapsibleTrigger>
							</CardHeader>
							<CollapsibleContent>
								<CardContent>
									<div className="space-y-4">
										<div className="p-3 bg-muted/50 rounded-lg">
											<div className="text-sm font-medium mb-1">
												Current Day Transition Duration
											</div>
											<div className="text-2xl font-bold">
												{(session.transitionDuration ?? 3000) / 1000} seconds
											</div>
											<div className="text-xs text-muted-foreground">
												Time shown for &quot;Day X&quot; screen before scenarios
											</div>
										</div>

										<div className="space-y-3">
											<div className="text-sm font-medium">Quick Presets</div>
											<div className="flex gap-2">
												{[1, 2, 3, 5, 7, 10].map((seconds) => (
													<Button
														key={seconds}
														variant={
															(session.transitionDuration ?? 3000) / 1000 ===
															seconds
																? "default"
																: "outline"
														}
														size="sm"
														onClick={async () => {
															if (!session?._id) return;
															await setTransitionDuration({
																sessionId: session._id,
																duration: seconds * 1000,
															});
														}}
													>
														{seconds}s
													</Button>
												))}
											</div>
										</div>

										<div className="space-y-3">
											<div className="text-sm font-medium">Custom Duration</div>
											<div className="flex items-center gap-2">
												<Input
													type="number"
													placeholder="Enter seconds (1-10)"
													value={durationInput}
													onChange={(e) => setDurationInput(e.target.value)}
													className="flex-1"
													min="1"
													max="10"
												/>
												<Button
													disabled={
														!durationInput || isNaN(Number(durationInput))
													}
													onClick={async () => {
														if (!session?._id || !durationInput) return;
														const seconds = Number(durationInput);
														if (seconds >= 1 && seconds <= 10) {
															await setTransitionDuration({
																sessionId: session._id,
																duration: seconds * 1000,
															});
															setDurationInput("");
														}
													}}
												>
													Apply
												</Button>
											</div>
											<div className="text-xs text-muted-foreground">
												Set any duration between 1-10 seconds
											</div>
										</div>
									</div>
								</CardContent>
							</CollapsibleContent>
						</Collapsible>
					</Card>
				</div>
			</main>
			<Footer />
		</div>
	);
}

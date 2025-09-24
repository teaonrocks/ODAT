"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function PresenterControlsPage() {
	const { sessionCode } = useParams<{ sessionCode: string }>();
	const router = useRouter();
	const session = useQuery(api.sessions.getSessionByCode, { sessionCode });
	const players = useQuery(
		api.players.getForSession,
		session?._id ? { sessionId: session._id } : "skip"
	);

	const startGame = useMutation(api.sessions.startGame);
	const nextDay = useMutation(api.sessions.advanceDay);

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
												await startGame({ sessionId: session._id });
											}}
											className="w-full"
											size="lg"
										>
											🚀 Start Game
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
											<div className="text-xs text-green-700 mt-1 font-medium">
												{players?.filter((p) =>
													p.choices?.some((c) => c.day === session.currentDay)
												).length || 0}{" "}
												of {players?.length || 0} players have made their choice
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
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
			<Footer />
		</div>
	);
}

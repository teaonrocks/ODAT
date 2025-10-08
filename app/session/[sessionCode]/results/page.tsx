"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function ResultsPage() {
	const { sessionCode } = useParams<{ sessionCode: string }>();
	const searchParams = useSearchParams();
	const session = useQuery(api.sessions.getSessionByCode, { sessionCode });
	const [showChoices, setShowChoices] = useState(false);

	const playerId = searchParams.get("playerId");

	const player = useQuery(
		api.players.getById,
		playerId ? { playerId: playerId as Id<"players"> } : "skip"
	);

	if (session === undefined || player === undefined) return null;
	if (!session) return <div className="p-6">Session not found.</div>;
	if (!player) return <div className="p-6">Player not found.</div>;

	const hitsHidden = session.hideHits ?? false;

	return (
		<>
			<main className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="text-center space-y-8 max-w-4xl mx-auto">
					{/* Celebration Header */}
					<div className="space-y-4">
						<h1 className="text-4xl md:text-6xl font-bold text-foreground">
							End of two weeks
							{/* fix font */}
						</h1>
						<p className="text-xl md:text-2xl text-muted-foreground">
							Do you think you can make it through another 14 days?
						</p>
					</div>

					{/* Player Name */}
					<div className="text-3xl font-bold text-foreground">
						{player.name}
					</div>

					{/* Results Summary */}
					<div className="bg-card rounded-2xl shadow-lg p-8 space-y-6 border border-muted-foreground/20">
						{/* Final Resources */}
						<div className="text-center">
							<div className="text-sm text-muted-foreground uppercase tracking-wide">
								Final Resources
							</div>
							<div className="text-5xl font-bold text-green-600 mt-2">
								${player.resources}
							</div>
						</div>

						{/* Status Grid */}
						<div
							className={`grid grid-cols-2 gap-6 ${hitsHidden ? "md:grid-cols-2" : "md:grid-cols-4"}`}
						>
							<div className="text-center">
								<div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
									Employment
								</div>
								<div
									className={`text-lg font-bold mt-2 ${
										player.isEmployed ? "text-green-600" : "text-red-600"
									}`}
								>
									{player.isEmployed ? "✓ Employed" : "✗ Unemployed"}
								</div>
							</div>

							{!hitsHidden && (
								<>
									<div className="text-center">
										<div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Family Hits
										</div>
										<div className="text-2xl font-bold text-foreground mt-2">
											{player.familyHits}
										</div>
									</div>

									<div className="text-center">
										<div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Health Hits
										</div>
										<div className="text-2xl font-bold text-foreground mt-2">
											{player.healthHits}
										</div>
									</div>

									<div className="text-center">
										<div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Job Hits
										</div>
										<div className="text-2xl font-bold text-foreground mt-2">
											{player.jobHits}
										</div>
									</div>
								</>
							)}
						</div>

						{hitsHidden && (
							<div className="text-sm text-muted-foreground bg-muted/30 border border-muted-foreground/20 rounded-lg p-4">
								Your facilitator has hidden hit counts for this session.
							</div>
						)}

						{/* Wedding Ring Status */}
						<div className="text-center pt-4 border-t border-muted-foreground/20">
							<div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
								Wedding Ring
							</div>
							<div
								className={`text-lg font-bold mt-2 ${
									player.ringPawned ? "text-red-600" : "text-green-600"
								}`}
							>
								{player.ringPawned ? "💍 Pawned" : "💍 Safe"}
							</div>
						</div>

						{/* View Choices Button */}
						<div className="pt-6">
							<Button
								onClick={() => setShowChoices(true)}
								className="w-full h-20 sm:h-24 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg sm:text-xl"
							>
								📋 View Your Choices
							</Button>
						</div>
					</div>

					{/* Session Code */}
					<div className="text-muted-foreground text-sm">
						Session Code: {session.sessionCode}
					</div>
				</div>
			</main>

			{/* Choices Modal */}
			<Dialog open={showChoices} onOpenChange={setShowChoices}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">
							Your 14-Day Journey
						</DialogTitle>
					</DialogHeader>
					<div className="mt-4">
						<div className="space-y-4">
							{player.choices?.map((c, idx) => (
								<div
									key={idx}
									className="border rounded-lg p-4 hover:bg-muted/20 transition-colors border-muted-foreground/20"
								>
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
										<div className="flex items-center gap-3">
											<span className="font-bold text-muted-foreground bg-muted/30 px-3 py-1 rounded-full text-sm">
												Day {c.day}
											</span>
											<span className="text-blue-600 font-semibold">
												Choice {c.choice}
											</span>
										</div>
										<span
											className={`font-bold text-sm px-3 py-1 rounded-full ${
												c.consequence.resourceChange >= 0
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}
										>
											{c.consequence.resourceChange >= 0 ? "+" : ""}$
											{c.consequence.resourceChange}
										</span>
									</div>
									<div className="text-muted-foreground text-sm leading-relaxed">
										{c.consequence.narrative}
									</div>
								</div>
							))}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

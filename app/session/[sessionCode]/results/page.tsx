"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultsPage() {
	const { sessionCode } = useParams<{ sessionCode: string }>();
	const session = useQuery(api.sessions.getSessionByCode, { sessionCode });
	const players = useQuery(
		api.players.getForSession,
		session?._id ? { sessionId: session._id } : "skip"
	);

	if (session === undefined || players === undefined) return null;
	if (!session) return <div className="p-6">Session not found.</div>;

	return (
		<main className="min-h-screen flex items-center justify-center p-4">
			<Card className="w-full max-w-3xl">
				<CardHeader>
					<CardTitle>
						Simulation Complete — Code: {session.sessionCode}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						{players?.map((p) => (
							<div key={p._id} className="rounded-md border p-4">
								<div className="font-semibold">
									{p.name} — Final Resources: {p.resources}
								</div>
								<ol className="mt-2 list-decimal pl-6 space-y-1 text-sm">
									{p.choices?.map((c, idx) => (
										<li key={idx}>
											Day {c.day}: Choice {c.choice} — change{" "}
											{c.consequence.resourceChange} — {c.consequence.narrative}
										</li>
									))}
								</ol>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

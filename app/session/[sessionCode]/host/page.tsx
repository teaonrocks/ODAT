"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import InstructionSlides from "@/components/InstructionSlides";
import DayTransition from "@/components/DayTransition";
import DayResult from "@/components/DayResult";

function QRCodeCard({ sessionCode }: { sessionCode: string }) {
	const [qrUrl, setQrUrl] = useState<string>("");

	useEffect(() => {
		if (typeof window !== "undefined") {
			console.log(window.location.origin);
			const joinUrl = `${window.location.origin == "http://localhost:3000" ? "http://192.168.1.41:3000" : window.location.origin}/?code=${sessionCode}`;
			const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`;
			setQrUrl(qrCodeUrl);
		}
	}, [sessionCode]);

	if (!qrUrl) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl sm:text-2xl">Scan to Join</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col items-center space-y-4">
				<div className="p-4 bg-white rounded-lg shadow-inner">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={qrUrl}
						alt="QR Code to join session"
						className="w-48 h-48"
					/>
				</div>
				<p className="text-sm text-muted-foreground">
					Players can scan this code to join the session
				</p>
			</CardContent>
		</Card>
	);
}

export default function HostPage() {
	const { sessionCode } = useParams<{ sessionCode: string }>();
	const session = useQuery(api.sessions.getSessionByCode, { sessionCode });
	const scenario = useQuery(
		api.scenarios.get,
		session?.currentDay ? { day: session.currentDay } : "skip"
	);
	const startInstructions = useMutation(api.sessions.startInstructions);
	const showDayScenario = useMutation(api.sessions.showDayScenario);

	// Auto-advance from day transition to scenario after configurable duration
	useEffect(() => {
		if (session?.gameState === "DAY_TRANSITION" && session?._id) {
			const duration = session.transitionDuration ?? 1000; // Default to 1 second
			console.log(
				`Day ${session.currentDay}: Starting ${duration}ms transition timer...`
			);
			const timer = setTimeout(() => {
				console.log(
					`Day ${session.currentDay}: Transition complete, showing scenario`
				);
				showDayScenario({ sessionId: session._id });
			}, duration);

			return () => {
				console.log(`Day ${session.currentDay}: Cleanup transition timer`);
				clearTimeout(timer);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		session?.gameState,
		session?._id,
		session?.transitionDuration,
		session?.currentDay,
	]);

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
								An experiential activity
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

					<QRCodeCard sessionCode={session.sessionCode} />

					<Card>
						<CardContent className="py-6 space-y-4">
							<p className="text-lg text-muted-foreground">
								Waiting for players to join...
							</p>
							<Button
								onClick={() => startInstructions({ sessionId: session._id })}
								className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
							>
								Start Instructions
							</Button>
						</CardContent>
					</Card>
				</div>
			</main>
		);
	}

	// Instructions slide
	if (session.gameState === "INSTRUCTIONS") {
		return (
			<InstructionSlides
				currentSlide={session.currentDay ?? 0}
				totalSlides={13}
			/>
		);
	}

	// Day transition
	if (session.gameState === "DAY_TRANSITION") {
		return <DayTransition day={session.currentDay ?? 1} />;
	}

	// Day result sub-pages
	if (session.gameState === "DAY_RESULT" && scenario?.subPages) {
		const currentSubPage = session.currentSubPage ?? 0;
		const subPage = scenario.subPages[currentSubPage];

		if (subPage) {
			return <DayResult title={subPage.title} content={subPage.content} />;
		}
	}

	// Game finished slide
	if (session.gameState === "FINISHED") {
		return (
			<main className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-4xl text-center space-y-8">
					<Card>
						<CardHeader className="pb-8">
							<CardTitle className="text-4xl sm:text-6xl font-bold">
								End of two weeks
							</CardTitle>
							<p className="text-xl sm:text-2xl text-muted-foreground mt-4">
								You need to repay your loans and redeem your wedding ring.
							</p>
						</CardHeader>
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
							<div className="flex justify-center items-center">
								<CardTitle className="text-2xl font-bold">
									<p className="text-2xl font-bold">Day {session.currentDay}</p>
								</CardTitle>
							</div>
						</CardHeader>
					</Card>

					{/* Scenario Prompt */}
					<Card>
						<CardContent>
							<div className="bg-muted/50 rounded-lg p-6 sm:p-8">
								<p className="text-lg sm:text-3xl leading-relaxed text-center font-bold">
									{scenario.prompt}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Options */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
						{/* Option A - Blue */}
						<Card className="bg-blue-600 flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center gap-2"></CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-4">
								<p className="text-base sm:text-3xl leading-relaxed text-white text-center h-full">
									{scenario.optionA_text}
								</p>
								<div className="text-right">
									<div className="inline-block bg-neutral-50 text-white px-4 py-2 rounded-full">
										<span className="text-xl font-bold text-black">
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
						<Card className="bg-yellow-600 flex flex-col">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									{/* <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-lg font-bold">
										Option B
									</span> */}
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 flex flex-col justify-between space-y-4">
								<p className="text-base sm:text-3xl leading-relaxed text-white text-center ">
									{scenario.optionB_text}
								</p>
								<div className="text-right">
									<div className="inline-block bg-neutral-50 text-black px-4 py-2 rounded-full">
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

					{/* <Card>
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
					</Card> */}
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

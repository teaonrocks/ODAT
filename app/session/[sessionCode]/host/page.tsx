"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<Card className="bg-background/80">
			<CardHeader>
				<CardTitle className="text-3xl sm:text-4xl font-semibold">
					Scan to Join
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col items-center space-y-6">
				<div className="p-6 bg-white rounded-2xl shadow-inner">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={qrUrl}
						alt="QR Code to join session"
						className="w-64 h-64"
					/>
				</div>
				<p className="text-lg sm:text-2xl text-muted-foreground">
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
			<main className="min-h-screen flex items-center justify-center bg-background p-8">
				<div className="w-full max-w-6xl text-center space-y-12">
					<Card className="bg-background/90">
						<CardHeader className="pb-12">
							<CardTitle className="text-5xl sm:text-7xl font-bold">
								One Day at a Time
							</CardTitle>
							<p className="text-2xl sm:text-3xl text-muted-foreground mt-6">
								An experiential activity
							</p>
						</CardHeader>
					</Card>

					<Card className="bg-background/90">
						<CardHeader>
							<CardTitle className="text-3xl sm:text-4xl font-semibold">
								Session Code
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-5xl sm:text-7xl font-mono font-extrabold tracking-[0.35em] uppercase bg-muted/60 rounded-3xl px-12 py-10">
								{session.sessionCode}
							</div>
						</CardContent>
					</Card>

					<QRCodeCard sessionCode={session.sessionCode} />
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
			<main className="min-h-screen flex items-center justify-center bg-background p-8">
				<div className="w-full max-w-6xl text-center space-y-12">
					<Card className="bg-background/90">
						<CardHeader className="pb-12">
							<CardTitle className="text-5xl sm:text-7xl font-bold">
								End of two weeks
							</CardTitle>
							<p className="text-2xl sm:text-3xl text-muted-foreground mt-6">
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
			<main className="min-h-screen flex items-center justify-center bg-background p-8">
				<div className="w-full max-w-[1200px] space-y-12">
					<Card className="bg-background/90">
						<CardHeader>
							<div className="flex justify-center items-center">
								<CardTitle className="text-4xl sm:text-5xl font-bold">
									Day {session.currentDay}
								</CardTitle>
							</div>
						</CardHeader>
					</Card>

					<Card className="bg-background/90">
						<CardContent>
							<div className="bg-muted/40 rounded-3xl px-10 py-12">
								<p className="text-3xl sm:text-4xl leading-snug text-center font-bold">
									{scenario.prompt}
								</p>
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
						<Card className="bg-blue-600 flex flex-col h-full">
							<CardContent className="flex-1 flex flex-col justify-between gap-6 p-10">
								<p className="text-3xl sm:text-4xl leading-snug text-white text-center">
									{scenario.optionA_text}
								</p>
								<div className="flex justify-center">
									<div className="inline-flex items-center gap-3 bg-white/90 text-black px-6 py-3 rounded-full shadow-lg">
										<span className="text-3xl font-extrabold">
											$
											{Math.abs(
												scenario.optionA_consequence.resourceChange || 0
											)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="bg-yellow-600 flex flex-col h-full">
							<CardContent className="flex-1 flex flex-col justify-between gap-6 p-10">
								<p className="text-3xl sm:text-4xl leading-snug text-white text-center">
									{scenario.optionB_text}
								</p>
								<div className="flex justify-center">
									<div className="inline-flex items-center gap-3 bg-white/90 text-black px-6 py-3 rounded-full shadow-lg">
										<span className="text-3xl font-extrabold">
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

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
						{scenario.optionA_details ? (
							<Card className="bg-background/70 border border-border/40 shadow-lg">
								<CardContent className="text-xl">
									{scenario.optionA_details.map((detail, index) => (
										<p key={index}>{detail}</p>
									))}
								</CardContent>
							</Card>
						) : (
							<div className="hidden lg:block" />
						)}

						{scenario.optionB_details ? (
							<Card className="bg-background/70 border border-border/40 shadow-lg">
								<CardContent className="text-xl">
									{scenario.optionB_details.map((detail, index) => (
										<p key={index}>{detail}</p>
									))}
								</CardContent>
							</Card>
						) : (
							<div className="hidden lg:block" />
						)}
					</div>
				</div>
			</main>
		);
	}

	// Fallback
	return (
		<main className="min-h-screen flex items-center justify-center bg-background">
			<Card className="w-full max-w-3xl">
				<CardContent className="text-center py-16">
					<p className="text-2xl text-muted-foreground">Loading...</p>
				</CardContent>
			</Card>
		</main>
	);
}

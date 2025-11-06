"use client";

interface DayTransitionProps {
	day: number;
}

export default function DayTransition({ day }: DayTransitionProps) {
	if (day === 0) {
		return (
			<main className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-white text-4xl sm:text-6xl font-bold text-center">
					Prepare Yourself
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-black flex items-center justify-center">
			<div className="text-white text-6xl sm:text-8xl font-bold">Day {day}</div>
		</main>
	);
}

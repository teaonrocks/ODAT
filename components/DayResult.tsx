import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DayResult({
	title,
	content,
}: {
	title: string;
	content: string;
}) {
	return (
		<main className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
			<div className="w-full max-w-4xl">
				<Card>
					<CardHeader>
						<CardTitle className="text-3xl sm:text-4xl font-bold text-center">
							{title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 rounded-lg p-6 sm:p-8">
							<p className="text-lg sm:text-2xl leading-relaxed text-center text-muted-foreground whitespace-pre-line">
								{content}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DayResult({
	title,
	content,
}: {
	title: string;
	content: string;
}) {
	return (
		<main className="min-h-screen flex items-center justify-center bg-background p-8">
			<div className="w-full max-w-[1000px]">
				<Card className="bg-background/90">
					<CardHeader>
						<CardTitle className="text-4xl sm:text-5xl font-bold text-center">
							{title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/40 rounded-3xl px-10 py-12">
							<p className="text-2xl sm:text-3xl leading-snug text-center text-muted-foreground whitespace-pre-line">
								{content}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

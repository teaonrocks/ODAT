import Link from "next/link";

export function Footer() {
	return (
		<footer className="w-full py-6 border-t border-border bg-background">
			<div className="container mx-auto px-4 text-center">
				<p className="text-sm text-muted-foreground">
					App developed by{" "}
					<Link
						href="https://archerchua.com"
						target="_blank"
						className="underline hover:text-primary"
					>
						Archer Chua
					</Link>
				</p>
			</div>
		</footer>
	);
}

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";

export default function Home() {
	const router = useRouter();
	const createSession = useMutation(api.sessions.create);
	const join = useMutation(api.players.join);
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [loadingCreate, setLoadingCreate] = useState(false);
	const [loadingJoin, setLoadingJoin] = useState(false);

	const onCreate = async () => {
		try {
			setLoadingCreate(true);
			const res = await createSession({});
			router.push(`/session/${res.sessionCode}/host/controls`);
		} finally {
			setLoadingCreate(false);
		}
	};

	const onJoin = async () => {
		if (!code || !name) return;
		try {
			setLoadingJoin(true);
			const codeUpper = code.trim().toUpperCase();
			const playerId = await join({ sessionCode: codeUpper, name });
			if (typeof window !== "undefined") {
				localStorage.setItem("odat_player_id", playerId);
				localStorage.setItem("odat_player_name", name);
			}
			router.push(`/session/${codeUpper}`);
		} finally {
			setLoadingJoin(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<main className="flex-1 flex flex-col items-center justify-center px-4">
				<div className="w-full max-w-md space-y-8 text-center">
					{/* Header */}
					<div className="space-y-4">
						<h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
							One Day At a Time
						</h1>
						<p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
							An experiential activity to gain greater awareness of the
							challenges faced by a low-income family
						</p>
					</div>

					{/* Form Section */}
					<div className="space-y-4 pt-8">
						<div className="space-y-3">
							<Input
								placeholder="Room Code"
								value={code}
								onChange={(e) => setCode(e.target.value.toUpperCase())}
								className="h-12 text-center text-lg font-medium bg-muted/30 border-muted-foreground/20 focus:border-primary"
							/>
							<Input
								placeholder="Your Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-12 text-center text-lg font-medium bg-muted/30 border-muted-foreground/20 focus:border-primary"
							/>
						</div>

						<div className="flex gap-3 pt-4">
							<Button
								onClick={onJoin}
								disabled={!code || !name || loadingJoin}
								className="flex-1 h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
							>
								{loadingJoin ? "Joining..." : "Join Session"}
							</Button>
						</div>

						<div className="pt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t border-muted-foreground/20" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="bg-background px-4 text-muted-foreground">
										or
									</span>
								</div>
							</div>
						</div>

						<Button
							onClick={onCreate}
							disabled={loadingCreate}
							variant="outline"
							className="w-full h-12 text-lg font-medium border-muted-foreground/20 hover:bg-muted/30"
						>
							{loadingCreate ? "Creating..." : "Create New Session"}
						</Button>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}

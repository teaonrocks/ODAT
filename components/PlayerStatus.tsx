"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Player = Doc<"players">;

export const JOB_TERMINATION_STORAGE_KEY = "odat_job_termination_alert_shown";

interface PlayerStatusProps {
	player: Player;
	showHits?: boolean;
}

export function HitsDisplay({
	current,
	label,
	hitType,
	showGreyedOut = false,
}: {
	current: number;
	label: string;
	hitType: "family" | "health" | "job";
	showGreyedOut?: boolean;
}) {
	const getHitColors = (
		type: "family" | "health" | "job",
		isGreyed: boolean = false
	) => {
		if (isGreyed) {
			return "bg-gray-400 border-gray-400 opacity-50";
		}

		switch (type) {
			case "family":
				return "bg-blue-500 border-blue-500";
			case "health":
				return "bg-red-500 border-red-500";
			case "job":
				return "bg-green-500 border-green-500";
			default:
				return "bg-red-500 border-red-500";
		}
	};

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium w-20">{label} Hit:</span>
			<div className="flex gap-1">
				{current === 0 ? (
					<></>
				) : (
					Array.from({ length: current }, (_, i) => (
						<div
							key={i}
							className={`w-3 h-3 rounded-full border ${getHitColors(hitType, showGreyedOut)}`}
						/>
					))
				)}
			</div>
		</div>
	);
}

export function PlayerStatus({ player, showHits = true }: PlayerStatusProps) {
	const [borrowDialog, setBorrowDialog] = useState(false);
	const [repayDialog, setRepayDialog] = useState(false);
	const [pawnDialog, setPawnDialog] = useState(false);
	const [redeemDialog, setRedeemDialog] = useState(false);
	const [jobTerminationDialog, setJobTerminationDialog] = useState(false);
	const hasShownTerminationDialogRef = useRef(false);

	const borrowMoney = useMutation(api.players.borrowMoney);
	const pawnRing = useMutation(api.players.pawnRing);
	const repayLoan = useMutation(api.players.repayLoan);
	const redeemRing = useMutation(api.players.redeemRing);

	const handleBorrow = async (amount: number) => {
		try {
			await borrowMoney({ playerId: player._id, amount });
			setBorrowDialog(false);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to borrow money");
		}
	};

	const handleRepay = async (amount: number) => {
		try {
			await repayLoan({
				playerId: player._id,
				repaymentAmount: amount,
			});
			setRepayDialog(false);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to repay loan");
		}
	};

	const handlePawnRing = async () => {
		try {
			await pawnRing({ playerId: player._id });
			setPawnDialog(false);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to pawn ring");
		}
	};

	const handleRedeemRing = async () => {
		try {
			await redeemRing({ playerId: player._id });
			setRedeemDialog(false);
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to redeem ring");
		}
	};

	useEffect(() => {
		if (typeof window === "undefined") return;
		const hasSeenAlert = localStorage.getItem(JOB_TERMINATION_STORAGE_KEY);
		hasShownTerminationDialogRef.current = hasSeenAlert === "true";
	}, []);

	useEffect(() => {
		if (
			player.jobHits >= 3 &&
			!hasShownTerminationDialogRef.current &&
			typeof window !== "undefined"
		) {
			setJobTerminationDialog(true);
			hasShownTerminationDialogRef.current = true;
			localStorage.setItem(JOB_TERMINATION_STORAGE_KEY, "true");
		}
	}, [player.jobHits]);

	return (
		<>
			<Card className="w-full">
				<CardContent className="space-y-6 p-6">
					{/* Financial Status */}
					<div className="text-3xl font-bold mb-4">
						Cash: ${player.resources}
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Button
							onClick={() => setBorrowDialog(true)}
							disabled={player.borrowCount >= 3}
							className="text-sm py-3"
						>
							Borrow Money ({player.borrowCount}/3)
						</Button>

						<Button
							onClick={() => setPawnDialog(true)}
							disabled={player.ringPawned}
							className="text-sm py-3"
						>
							{player.ringPawned ? "Ring Pawned" : "Pawn Ring ($150)"}
						</Button>

						<Button
							onClick={() => setRepayDialog(true)}
							disabled={player.loanBalance === 0}
							className="text-sm py-3"
						>
							Repay Loan
						</Button>

						<Button
							onClick={() => setRedeemDialog(true)}
							disabled={!player.ringPawned || player.resources < 159}
							className="text-sm py-3"
						>
							Redeem Ring ($159)
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-6 mt-6">
						<div className="space-y-3">
							<div className="text-sm font-medium py-1">
								Loan: ${player.loanBalance}
							</div>
							<div className="text-sm font-medium py-1">
								Wedding Ring:{" "}
								<span
									className={
										player.ringPawned ? "text-red-600" : "text-green-600"
									}
								>
									{player.ringPawned ? "Pawned" : "Available"}
								</span>
							</div>
							<div className="text-sm font-medium py-1">
								Employment:{" "}
								<span
									className={
										player.isEmployed ? "text-green-600" : "text-red-600"
									}
								>
									{player.isEmployed ? "Employed" : "Unemployed"}
								</span>
							</div>
						</div>

						{/* Hits Display */}
						<div className="space-y-3">
							{showHits ? (
								<>
									{/* Family Hits - always show, greyed out if converted to health */}
									<HitsDisplay
										current={player.familyHits}
										label="Family"
										hitType="family"
										showGreyedOut={
											player.healthHits > 0 && player.familyHits === 3
										}
									/>

									{/* Health Hits - always show, greyed out if converted to job */}
									<HitsDisplay
										current={player.healthHits}
										label="Health"
										hitType="health"
										showGreyedOut={
											player.jobHits > 0 && player.healthHits === 3
										}
									/>

									{/* Job Hits - always show */}
									<HitsDisplay
										current={player.jobHits}
										label="Job"
										hitType="job"
									/>
								</>
							) : (
								<div className="p-3 rounded-lg bg-muted/40 text-sm text-muted-foreground border border-muted-foreground/20 text-center">
									Hits are currently hidden by Activity Host
								</div>
							)}
						</div>
					</div>

					{/* Action Buttons */}
				</CardContent>
			</Card>

			{/* Borrow Money Dialog */}
			<Dialog open={borrowDialog} onOpenChange={setBorrowDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Borrow Money</DialogTitle>
						<DialogDescription>
							Choose an amount to borrow. Interest of 10% will apply when
							repaying.
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-2">
						<Button onClick={() => handleBorrow(100)} className="text-sm">
							Borrow $100
						</Button>
						<Button onClick={() => handleBorrow(200)} className="text-sm">
							Borrow $200
						</Button>
						<Button onClick={() => handleBorrow(300)} className="text-sm">
							Borrow $300
						</Button>
						<Button onClick={() => handleBorrow(400)} className="text-sm">
							Borrow $400
						</Button>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBorrowDialog(false)}>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Repay Loan Dialog */}
			<Dialog open={repayDialog} onOpenChange={setRepayDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Repay Loan</DialogTitle>
						<DialogDescription>
							Choose an amount to repay. 10% interest will be added to the
							repayment amount.
						</DialogDescription>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						{`Current loan balance: $${player.loanBalance}`}
					</p>
					<div className="space-y-2">
						<div className="grid grid-cols-2 gap-2">
							{[100, 200, 300, 400].map((amount) => (
								<Button
									key={amount}
									onClick={() => handleRepay(amount)}
									disabled={amount > player.loanBalance}
									className="text-sm"
								>
									Repay ${amount} (Cost: ${Math.round(amount * 1.1)})
								</Button>
							))}
							{player.loanBalance > 0 && (
								<Button
									onClick={() => handleRepay(player.loanBalance)}
									className="text-sm col-span-2"
								>
									Pay All ${player.loanBalance} (Cost: $
									{Math.round(player.loanBalance * 1.1)})
								</Button>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRepayDialog(false)}>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Pawn Ring Confirmation */}
			<AlertDialog open={pawnDialog} onOpenChange={setPawnDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Pawn Wedding Ring</AlertDialogTitle>
						<AlertDialogDescription>
							Pawning your wedding ring will give you $150 immediately, but you
							will lose the ring until you redeem it for $159 later.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handlePawnRing}
							disabled={player.ringPawned}
						>
							Confirm Pawn ($150)
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Redeem Ring Confirmation */}
			<AlertDialog open={redeemDialog} onOpenChange={setRedeemDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Redeem Wedding Ring</AlertDialogTitle>
						<AlertDialogDescription>
							Redeeming your wedding ring costs $159. Make sure you have enough
							cash on hand before confirming.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRedeemRing}
							disabled={!player.ringPawned || player.resources < 159}
						>
							Confirm Redeem ($159)
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Job Termination Alert */}
			<AlertDialog
				open={jobTerminationDialog}
				onOpenChange={setJobTerminationDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>You&apos;ve Been Fired!</AlertDialogTitle>
						<AlertDialogDescription>
							You have been fired from your job. You will not receive any money
							on the next payday. You still have to keep making decisions—life
							goes on.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => setJobTerminationDialog(false)}>
							I Understand
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

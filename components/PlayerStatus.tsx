"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type Player = Doc<"players">;

interface PlayerStatusProps {
	player: Player;
}

function HitsDisplay({
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
		<div className="flex items-center gap-2 ">
			<span className="text-sm font-medium w-auto">{label} hits:</span>
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

export function PlayerStatus({ player }: PlayerStatusProps) {
	const [borrowDialog, setBorrowDialog] = useState(false);
	const [repayDialog, setRepayDialog] = useState(false);

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
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to pawn ring");
		}
	};

	const handleRedeemRing = async () => {
		try {
			await redeemRing({ playerId: player._id });
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to redeem ring");
		}
	};

	return (
		<>
			<Card className="w-full">
				<CardContent className="space-y-4">
					{/* Financial Status */}
					<div className="text-2xl font-semibold">
						Cash: ${player.resources}
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={() => setBorrowDialog(true)}
							disabled={player.borrowCount >= 3}
							className="text-sm"
						>
							Borrow Money ({player.borrowCount}/3)
						</Button>

						<Button
							onClick={handlePawnRing}
							disabled={player.ringPawned}
							className="text-sm"
						>
							{player.ringPawned ? "Ring Pawned" : "Pawn Ring ($150)"}
						</Button>

						<Button
							onClick={() => setRepayDialog(true)}
							disabled={player.loanBalance === 0}
							className="text-sm"
						>
							Repay Loan
						</Button>

						<Button
							onClick={handleRedeemRing}
							disabled={!player.ringPawned || player.resources < 159}
							className="text-sm"
						>
							Redeem Ring ($159)
						</Button>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="text-sm font-medium">
								Loan: ${player.loanBalance}
							</div>
							<div className="text-sm font-medium">
								Wedding Ring: {player.ringPawned ? "Pawned" : "Available"}
							</div>
							<div className="text-sm font-medium">
								Employment: {player.isEmployed ? "Employed" : "Unemployed"}
							</div>
						</div>

						{/* Hits Display */}
						<div className="space-y-2">
							{/* Family Hits - always show, greyed out if converted to health */}
							<HitsDisplay
								current={player.familyHits}
								label="Family"
								hitType="family"
								showGreyedOut={player.healthHits > 0 && player.familyHits === 3}
							/>

							{/* Health Hits - always show, greyed out if converted to job */}
							<HitsDisplay
								current={player.healthHits}
								label="Health"
								hitType="health"
								showGreyedOut={player.jobHits > 0 && player.healthHits === 3}
							/>

							{/* Job Hits - always show */}
							<HitsDisplay current={player.jobHits} label="Job" hitType="job" />
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
					</DialogHeader>
					<div className="space-y-4">
						<p className="text-sm text-gray-600">
							Choose an amount to borrow. Interest of 10% will apply when
							repaying.
						</p>
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
						<div className="flex justify-end">
							<Button
								onClick={() => setBorrowDialog(false)}
								className="bg-gray-500 text-white hover:bg-gray-600"
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Repay Loan Dialog */}
			<Dialog open={repayDialog} onOpenChange={setRepayDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Repay Loan</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="text-sm text-gray-600">
							Current loan balance: ${player.loanBalance}
						</div>
						<p className="text-sm text-gray-600">
							Choose an amount to repay. 10% interest will be added to the
							repayment amount.
						</p>

						{/* Repayment buttons */}
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

						<div className="flex justify-end">
							<Button
								onClick={() => setRepayDialog(false)}
								className="bg-gray-500 text-white hover:bg-gray-600"
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

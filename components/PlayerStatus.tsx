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
	max = 3,
	label,
}: {
	current: number;
	max?: number;
	label: string;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium w-16">{label}:</span>
			<div className="flex gap-1">
				{Array.from({ length: max }, (_, i) => (
					<div
						key={i}
						className={`w-3 h-3 rounded-full border ${
							i < current
								? "bg-red-500 border-red-500"
								: "bg-gray-200 border-gray-300"
						}`}
					/>
				))}
			</div>
			<span className="text-sm text-gray-600">
				({current}/{max})
			</span>
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
				<CardHeader>
					<CardTitle>Player Status</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Financial Status */}
					<div className="space-y-2">
						<div className="text-lg font-semibold">
							Cash: ${player.resources}
						</div>
						<div className="text-sm text-gray-600">
							Loan: ${player.loanBalance}
						</div>
						<div className="text-sm text-gray-600">
							Wedding Ring: {player.ringPawned ? "Pawned" : "Available"}
						</div>
						<div className="text-sm text-gray-600">
							Employment: {player.isEmployed ? "Employed" : "Unemployed"}
						</div>
					</div>

					{/* Hits Display */}
					<div className="space-y-2">
						<HitsDisplay current={player.familyHits} label="Family" />
						<HitsDisplay current={player.healthHits} label="Health" />
						<HitsDisplay current={player.jobHits} label="Job" />
					</div>

					{/* Action Buttons */}
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

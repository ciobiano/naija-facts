"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

interface DangerZoneTabProps {
	isLoading: boolean;
	onAccountDeletion: () => void;
}

export function DangerZoneTab({
	isLoading,
	onAccountDeletion,
}: DangerZoneTabProps) {
	const [confirmText, setConfirmText] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";
	const isConfirmationValid = confirmText === CONFIRMATION_TEXT;

	const handleDeleteAccount = () => {
		if (isConfirmationValid) {
			onAccountDeletion();
			setIsDialogOpen(false);
			setConfirmText("");
		}
	};

	return (
		<div className="space-y-6">
			{/* Account Deletion Section */}
			<Card className="">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-red-600">
						<AlertTriangle className="h-5 w-5" />
						Danger Zone
					</CardTitle>
					<CardDescription className="text-red-700">
						Irreversible actions that will permanently affect your account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Warning Section */}
					<div className="bg-red-100 border border-red-200 rounded-lg p-4">
						<h4 className="font-semibold text-red-800 mb-2">
							⚠️ Account Deletion Warning
						</h4>
						<div className="text-sm text-red-700 space-y-2">
							<p>Deleting your account will permanently:</p>
							<ul className="list-disc list-inside ml-4 space-y-1">
								<li>Remove all your personal information and profile data</li>
								<li>Delete your quiz progress and achievements</li>
								<li>Remove your learning preferences and history</li>
								<li>Cancel any active subscriptions or memberships</li>
								<li>Permanently delete all associated content</li>
							</ul>
							<p className="font-medium mt-3">
								This action cannot be undone. All data will be lost forever.
							</p>
						</div>
					</div>

					{/* Data Export Section */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="font-semibold text-blue-800 mb-2">
							📥 Download Your Data (Coming Soon)
						</h4>
						<p className="text-sm text-blue-700 mb-3">
							Before deleting your account, you can download a copy of your data
							including:
						</p>
						<ul className="text-sm text-blue-700 list-disc list-inside ml-4 space-y-1">
							<li>Profile information</li>
							<li>Quiz results and progress</li>
							<li>Learning preferences</li>
							<li>Achievement records</li>
						</ul>
						<Button
							variant="outline"
							size="sm"
							className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
							disabled
						>
							Download My Data (Coming Soon)
						</Button>
					</div>

					{/* Account Deletion Button */}
					<div className="pt-4 border-t border-red-200">
						<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
							<AlertDialogTrigger asChild>
								<Button
									variant="destructive"
									size="lg"
									className="w-full bg-red-600 hover:bg-red-700"
									disabled={isLoading}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									{isLoading ? "Processing..." : "Delete My Account"}
								</Button>
							</AlertDialogTrigger>

							<AlertDialogContent className="max-w-md">
								<AlertDialogHeader>
									<AlertDialogTitle className="flex items-center gap-2 text-red-600">
										<AlertTriangle className="h-5 w-5" />
										Confirm Account Deletion
									</AlertDialogTitle>
									<AlertDialogDescription className="text-left space-y-3">
										<p>
											This action will permanently delete your account and all
											associated data. This cannot be undone.
										</p>
										<p className="font-medium">
											To confirm, type{" "}
											<code className="bg-gray-100 px-1 rounded text-red-600">
												{CONFIRMATION_TEXT}
											</code>{" "}
											in the box below:
										</p>
									</AlertDialogDescription>
								</AlertDialogHeader>

								<div className="py-4">
									<Label
										htmlFor="confirm-deletion"
										className="text-sm font-medium"
									>
										Confirmation Text
									</Label>
									<Input
										id="confirm-deletion"
										value={confirmText}
										onChange={(e) => setConfirmText(e.target.value)}
										placeholder={CONFIRMATION_TEXT}
										className="mt-2"
										autoComplete="off"
									/>
								</div>

								<AlertDialogFooter>
									<AlertDialogCancel onClick={() => setConfirmText("")}>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteAccount}
										disabled={!isConfirmationValid || isLoading}
										className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
									>
										{isLoading ? "Deleting..." : "Delete Account"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>

					{/* Help Section */}
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
						<h4 className="font-semibold text-gray-800 mb-2">💬 Need Help?</h4>
						<p className="text-sm text-gray-600 mb-3">
							If you're experiencing issues or have concerns, we're here to
							help. Consider reaching out before deleting your account.
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								className="text-gray-600 border-gray-300 hover:bg-gray-100"
							>
								Contact Support
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="text-gray-600 border-gray-300 hover:bg-gray-100"
							>
								View FAQ
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

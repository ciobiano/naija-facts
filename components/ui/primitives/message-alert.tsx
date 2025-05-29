import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { MessageState } from "@/types";

interface MessageAlertProps {
	message: MessageState | null;
}

export function MessageAlert({ message }: MessageAlertProps) {
	if (!message) return null;

	return (
		<Alert
			className={
				message.type === "success" ? "border-green-500" : "border-red-500"
			}
		>
			{message.type === "success" ? (
				<CheckCircle className="h-4 w-4 text-green-500" />
			) : (
				<AlertTriangle className="h-4 w-4 text-red-500" />
			)}
			<AlertDescription
				className={
					message.type === "success" ? "text-green-700" : "text-red-700"
				}
			>
				{message.text}
			</AlertDescription>
		</Alert>
	);
}

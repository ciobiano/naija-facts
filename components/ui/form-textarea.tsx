"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
	label: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	error?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	rows?: number;
	maxLength?: number;
	className?: string;
}

export function FormTextarea({
	label,
	name,
	value,
	onChange,
	error,
	placeholder,
	required = false,
	disabled = false,
	rows = 3,
	maxLength,
	className,
}: FormTextareaProps) {
	const [touched, setTouched] = useState(false);

	const handleBlur = () => {
		setTouched(true);
	};

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex justify-between items-center">
				<Label htmlFor={name} className="text-sm font-medium">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</Label>
				{maxLength && (
					<span className="text-xs text-gray-500">
						{value.length}/{maxLength}
					</span>
				)}
			</div>
			<div className="relative">
				<Textarea
					id={name}
					name={name}
					value={value}
					onChange={onChange}
					onBlur={handleBlur}
					placeholder={placeholder}
					disabled={disabled}
					rows={rows}
					maxLength={maxLength}
					className={cn(
						error &&
							touched &&
							"border-red-500 focus:border-red-500 focus:ring-red-500"
					)}
					aria-invalid={error && touched ? "true" : "false"}
					aria-describedby={error && touched ? `${name}-error` : undefined}
				/>
				{error && touched && (
					<AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
				)}
			</div>
			{error && touched && (
				<p
					id={`${name}-error`}
					className="text-sm text-red-500 flex items-center gap-1"
				>
					<AlertCircle className="h-3 w-3" />
					{error}
				</p>
			)}
		</div>
	);
}

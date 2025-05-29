"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormInputProps {
	label: string;
	name: string;
	type?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	error?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	showPasswordToggle?: boolean;
	className?: string;
}

export function FormInput({
	label,
	name,
	type = "text",
	value,
	onChange,
	error,
	placeholder,
	required = false,
	disabled = false,
	showPasswordToggle = false,
	className,
}: FormInputProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [touched, setTouched] = useState(false);

	const inputType = showPasswordToggle
		? showPassword
			? "text"
			: "password"
		: type;

	const handleBlur = () => {
		setTouched(true);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor={name} className="text-sm font-medium">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</Label>
			<div className="relative">
				<Input
					id={name}
					name={name}
					type={inputType}
					value={value}
					onChange={onChange}
					onBlur={handleBlur}
					placeholder={placeholder}
					disabled={disabled}
					className={cn(
						showPasswordToggle && "pr-10",
						error &&
							touched &&
							"border-red-500 focus:border-red-500 focus:ring-red-500"
					)}
					aria-invalid={error && touched ? "true" : "false"}
					aria-describedby={error && touched ? `${name}-error` : undefined}
				/>
				{showPasswordToggle && (
					<button
						type="button"
						onClick={togglePasswordVisibility}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</button>
				)}
				{error && touched && !showPasswordToggle && (
					<AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
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

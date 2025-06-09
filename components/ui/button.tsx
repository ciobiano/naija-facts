import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-green-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-naija-green-700 text-white shadow-soft hover:bg-naija-green-800 hover:shadow-medium active:scale-95",
				destructive:
					"bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-medium active:scale-95",
				outline:
					"border border-naija-green-200 bg-transparent text-naija-green-700 shadow-soft hover:bg-naija-green-50 hover:border-naija-green-300 hover:shadow-medium active:scale-95 dark:border-naija-green-800 dark:text-naija-green-300 dark:hover:bg-naija-green-950 dark:hover:border-naija-green-700",
				secondary:
					"bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80 hover:shadow-medium active:scale-95",
				ghost:
					"text-naija-green-700 hover:bg-naija-green-50 hover:text-naija-green-800 active:scale-95 dark:text-naija-green-300 dark:hover:bg-naija-green-950",
				link: "text-naija-green-700 underline-offset-4 hover:underline hover:text-naija-green-800 dark:text-naija-green-300",
				// Professional Nigerian cultural variants
				naija:
					"bg-naija-green-700 text-white shadow-soft hover:bg-naija-green-800 hover:shadow-medium active:scale-95 border border-naija-green-700 hover:border-naija-green-800",
				cultural:
					"gradient-cultural text-white shadow-soft hover:shadow-medium active:scale-95 border border-naija-green-700",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-12 rounded-lg px-8 text-base",
				xl: "h-14 rounded-xl px-10 text-lg",
				icon: "h-10 w-10",
				// Mobile-optimized touch targets
				touch: "h-11 px-6 py-3 min-w-[44px] min-h-[44px]",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };

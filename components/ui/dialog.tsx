"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Dialog = React.forwardRef<
	React.ElementRef<"div">,
	React.ComponentPropsWithoutRef<"div"> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}
>(({ className, open, onOpenChange, children, ...props }, ref) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-black/50"
				onClick={() => onOpenChange?.(false)}
			/>
			<div
				ref={ref}
				className={cn(
					"relative z-50 w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg",
					className
				)}
				{...props}
			>
				{children}
			</div>
		</div>
	);
});
Dialog.displayName = "Dialog";

const DialogContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6", className)} {...props} />
));
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left mb-4",
			className
		)}
		{...props}
	/>
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			"text-lg font-semibold leading-none tracking-tight",
			className
		)}
		{...props}
	/>
));
DialogTitle.displayName = "DialogTitle";

export { Dialog, DialogContent, DialogHeader, DialogTitle };

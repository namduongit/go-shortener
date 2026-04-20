import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type LoadingPosition = "start" | "end" | "replace";

interface LegacyButtonOptions {
	text?: string;
	loading?: boolean;
	textLoading?: string;
	disabled?: boolean;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	children?: ReactNode;
	loading?: boolean;
	loadingText?: ReactNode;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	fullWidth?: boolean;
	loadingPosition?: LoadingPosition;
	spinnerClassName?: string;
	contentClassName?: string;
	// Keep backward compatibility for existing call sites using opts.
	opts?: LegacyButtonOptions;
}

const Spinner = ({ className = "" }: { className?: string }) => (
	<svg
		className={`h-4 w-4 animate-spin ${className}`.trim()}
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden="true"
	>
		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
		<path
			className="opacity-90"
			fill="currentColor"
			d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
		/>
	</svg>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
	className = "",
	children,
	opts,
	loading,
	loadingText,
	leftIcon,
	rightIcon,
	fullWidth = false,
	loadingPosition = "start",
	spinnerClassName = "",
	contentClassName = "",
	disabled,
	onClick,
	type,
	...props
}, ref) => {
	const isLoading = loading ?? opts?.loading ?? false;
	const legacyDisabled = opts?.disabled ?? false;
	const isDisabled = Boolean(disabled || legacyDisabled || isLoading);

	const defaultContent = children ?? opts?.text;
	const displayContent = isLoading ? (loadingText ?? opts?.textLoading ?? defaultContent) : defaultContent;
	const showContent = displayContent !== undefined && displayContent !== null;

	const baseClassName = "inline-flex items-center gap-2 cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 disabled:cursor-not-allowed disabled:opacity-60";
	const widthClassName = fullWidth ? "w-full" : "";

	const handleClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] = (event) => {
		if (isDisabled) {
			event.preventDefault();
			return;
		}

		onClick?.(event);
	};

	const renderSpinner = isLoading ? <Spinner className={spinnerClassName} /> : null;
	const shouldShowLeftIcon = !isLoading && leftIcon !== undefined && leftIcon !== null;
	const shouldShowRightIcon = !isLoading && rightIcon !== undefined && rightIcon !== null;

	return (
		<button
			ref={ref}
			type={type ?? "button"}
			disabled={isDisabled}
			aria-busy={isLoading || undefined}
			data-loading={isLoading ? "true" : "false"}
			className={`${baseClassName} ${widthClassName} ${className}`.trim()}
			onClick={handleClick}
			{...props}
		>
			{isLoading && loadingPosition === "start" && renderSpinner}
			{shouldShowLeftIcon && leftIcon}
			{isLoading && loadingPosition === "replace" && renderSpinner}
			{showContent && (contentClassName
				? <span className={contentClassName}>{displayContent}</span>
				: displayContent)}
			{shouldShowRightIcon && rightIcon}
			{isLoading && loadingPosition === "end" && renderSpinner}
		</button>
	);
});

Button.displayName = "Button";

export default Button;

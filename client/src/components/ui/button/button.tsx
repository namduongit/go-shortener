import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary: "bg-[#1a73e8] text-white hover:bg-[#175fc0]",
	secondary: "border border-[#d9e1ef] bg-white text-[#202124] hover:bg-[#f8f9fa]",
	ghost: "text-[#202124] hover:bg-[#f8f9fa]",
};

const Button = ({ variant = "primary", className = "", children, ...props }: ButtonProps) => {
	return (
		<button
			className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${variantClasses[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;

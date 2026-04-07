import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	children: ReactNode;
}

const Button = ({ className = "", children, ...props }: ButtonProps) => {
	return (
		<button
			className={`
				cursor-pointer transition
				${className}
				`}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;

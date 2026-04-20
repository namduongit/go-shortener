import Button from "../button/button";

interface PlanCardProps {
	title: string;
	price: string;
	description: string;
	features: string[];
	highlight?: boolean;
	actionLabel: string;
}

const PlanCard = ({ title, price, description, features, highlight = false, actionLabel }: PlanCardProps) => {
	return (
		<article
			className={`rounded-xl border p-5 ${
				highlight ? "border-[#cfe0fc] bg-[#f8fbff]" : "border-gray-300/90 bg-white"
			}`}
		>
			<p className="text-sm font-semibold text-gray-500">{title}</p>
			<p className="mt-2 text-3xl font-semibold text-gray-900">{price}</p>
			<p className="mt-1 text-sm text-gray-500">{description}</p>

			<ul className="mt-5 space-y-2 text-sm text-gray-900">
				{features.map((feature) => (
					<li key={feature} className="flex items-center gap-2">
						<span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
						{feature}
					</li>
				))}
			</ul>

			<Button
				type="button"
				className={`mt-5 w-full rounded-md border px-4 py-2 text-sm font-semibold ${
					highlight
						? "border-[#1a73e8] bg-[#1a73e8] text-white hover:bg-blue-700"
						: "border-gray-300/90 bg-white text-gray-900 hover:bg-gray-50"
				}`}
			>
				{actionLabel}
			</Button>
		</article>
	);
};

export default PlanCard;

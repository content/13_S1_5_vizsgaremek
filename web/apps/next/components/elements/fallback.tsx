import LandingHeader from "@/components/elements/landing-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FallbackProps = {
	title?: string;
	description?: string;
	showHeader?: boolean;
};

export default function Fallback({
	title = "Feldolgozás...",
	description = "Kérjük várj, betöltés folyamatban.",
	showHeader = true,
}: FallbackProps) {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			{showHeader ? <LandingHeader /> : null}
			<main className="flex-1 flex items-center justify-center px-4 py-12">
				<Card className="w-full max-w-md border-border">
					<CardHeader className="space-y-1 flex flex-col items-center">
						<CardTitle className="text-2xl font-bold">{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</CardHeader>
				</Card>
			</main>
		</div>
	);
}

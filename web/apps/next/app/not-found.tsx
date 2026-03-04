import LandingHeader from "@/components/elements/landing-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<LandingHeader />
			<main className="flex-1 flex items-center justify-center px-4 py-12">
				<Card className="w-full max-w-md border-none">
					<CardHeader className="space-y-2 text-center">
						<CardTitle className="text-6xl font-bold">404</CardTitle>
						<CardDescription>Az oldal nem található.</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<p className="text-center text-sm text-muted-foreground">
							Nem találtuk a keresett oldalt. Kérjük ellenőrizd a címet, vagy térj vissza a főoldalra.
						</p>
						<div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
							<Button className="bg-green-500 hover:bg-green-600" asChild>
								<Link href="/">Vissza a főoldalra</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

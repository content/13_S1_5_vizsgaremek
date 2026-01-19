import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import Link from "next/link";

export default function LandingHeader() {
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-green-400-foreground" />
              </div>
              <span className="text-xl font-semibold">Studify</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Bejelentkezés</Link>
              </Button>
              <Button className="bg-green-500 hover:bg-green-600" asChild>
                <Link href="/register">Regisztráció</Link>
              </Button>
            </div>
          </div>
        </header>
    )
}
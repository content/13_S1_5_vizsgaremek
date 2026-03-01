import LandingHeader from "@/components/elements/landing-header";
import { useNotificationProvider } from "@/components/notification-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailToken } from "@/lib/encryption/encryption";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import React from "react";


export default function EmailChangePage() {
    const searchParams = useSearchParams();
    
    const { notify } = useNotificationProvider();

    const [isSolving, setIsSolving] = React.useState(true);
    const [token, setToken] = React.useState<string | null>(null);
    const [solvedToken, setSolvedToken] = React.useState<string | null>(null);

    const [email, setEmail] = React.useState<string | null>(null);

    const sendVerificationRequest = async () => {
        if(!solvedToken) return;

        const response = await fetch("/api/account/change-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const result = await response.json();
        if(response.ok) {
            notify(result.message, { type: "success" });

            setEmail(solvedToken.split("|")[1]);
        } else {
            notify(result.error || "Hiba történt az email cím megváltoztatása során!", { type: "error" });
        }
    }

    React.useEffect(() => {
        if(!searchParams) return;

        const hashFromParams = searchParams.get("token");
        setToken(hashFromParams);
    }, [searchParams]);

    React.useEffect(() => {
        const solveToken = async () => {
            const solvedToken = await verifyEmailToken(token || "");
            setSolvedToken(solvedToken);
            setIsSolving(false);
        }
        
        solveToken();
    }, [token]);

    React.useEffect(() => {
        if(!solvedToken && !isSolving) {
            notify("Érvénytelen vagy lejárt token!", { type: "error", description: "Kérjük próbáld meg újra!" });
            redirect("/register");
        }

        sendVerificationRequest();
    }, [solvedToken]);

    return (
        <div className="min-h-screen bg-background flex flex-col">

            {/* Header */}
            <LandingHeader />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-border">
                    <CardHeader className="space-y-1 flex flex-col items-center">
                        <CardTitle className="text-2xl font-bold">Email megerősítve</CardTitle>
                        <CardDescription>Sikeresen megváltoztattad az email címed!</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center mt-5">
                        <p className="text-muted-foreground">A továbbiakban ezzel az email címmel tudsz bejelentkezni:</p>
                        <p className="text-muted-foreground"><span className="text-white">{email}</span></p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
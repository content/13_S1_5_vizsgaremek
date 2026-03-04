"use client";

import LandingHeader from "@/components/elements/landing-header";
import { useNotificationProvider } from "@/components/notification-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailToken } from "@/lib/encryption/encryption";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function EmailChangePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { notify } = useNotificationProvider();

    const [isSolving, setIsSolving] = React.useState(true);
    const [email, setEmail] = React.useState<string | null>(null);
    const [isSuccess, setIsSuccess] = React.useState(false);

    React.useEffect(() => {
        if (!searchParams) return;

        const rawToken = searchParams.get("token");
        if (!rawToken) {
            notify("Érvénytelen vagy lejárt token!", {
                type: "error",
                description: "Kérjük próbáld meg újra!",
            });
            router.push("/register");
            return;
        }

        const resolveAndVerify = async () => {
            try {
                const solvedToken = await verifyEmailToken(rawToken);

                if (!solvedToken) {
                    notify("Érvénytelen vagy lejárt token!", {
                        type: "error",
                        description: "Kérjük próbáld meg újra!",
                    });
                    router.push("/register");
                    return;
                }

                const response = await fetch("/api/account/change-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: rawToken }),
                });

                const result = await response.json();

                if (response.ok) {
                    notify(result.message, { type: "success" });
                    setEmail(solvedToken.split("|")[1]);
                    setIsSuccess(true);
                } else {
                    notify(result.error || "Hiba történt az email cím megváltoztatása során!", {
                        type: "error",
                    });
                    router.push("/register");
                }
            } catch (err) {
                notify("Váratlan hiba történt!", { type: "error" });
                router.push("/register");
            } finally {
                setIsSolving(false);
            }
        };

        resolveAndVerify();
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isSolving) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <LandingHeader />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-md border-border">
                        <CardHeader className="space-y-1 flex flex-col items-center">
                            <CardTitle className="text-2xl font-bold">Feldolgozás...</CardTitle>
                            <CardDescription>Kérjük várj, ellenőrzés folyamatban.</CardDescription>
                        </CardHeader>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <LandingHeader />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-border">
                    <CardHeader className="space-y-1 flex flex-col items-center">
                        <CardTitle className="text-2xl font-bold">Email megerősítve</CardTitle>
                        <CardDescription>Sikeresen megváltoztattad az email címed!</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center mt-5">
                        <p className="text-muted-foreground">
                            A továbbiakban ezzel az email címmel tudsz bejelentkezni:
                        </p>
                        <p className="text-muted-foreground">
                            <span className="text-white">{email}</span>
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
"use client";

import LandingHeader from "@/components/elements/landing-header";
import { useNotificationProvider } from "@/components/notification-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyEmailToken } from "@/lib/encryption/encryption";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [isSolving, setIsSolving] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [solvedToken, setSolvedToken] = useState<string | null>(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!searchParams) return;

        const tokenFromParams = searchParams.get("token");
        setToken(tokenFromParams);
    }, [searchParams]);

    useEffect(() => {
        if (!token) return;

        const solveToken = async () => {
            try {
                const solved = await verifyEmailToken(token);
                setSolvedToken(solved);
            } catch (error) {
                setSolvedToken(null);
            } finally {
                setIsSolving(false);
            }
        };

        solveToken();
    }, [token]);

    useEffect(() => {
        if (!solvedToken && !isSolving) {
            notify("Érvénytelen vagy lejárt token!", {
                type: "error",
                description: "Kérj új jelszó visszaállítási linket!",
            });
            router.push("/login/forgot");
        }
    }, [solvedToken, isSolving, notify, router]);

    useEffect(() => {
        if (status === "loading") return;

        if (session && session.user !== null) {
            notify("Már be vagy jelentkezve!", {
                type: "info",
                description: "Kijelentkezés után próbáld meg újra a jelszó visszaállítást!",
            });
            router.push("/dashboard");
        }
    }, [session, status, notify, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            notify("Hiányzó token!", { type: "error", description: "Kérj új jelszó visszaállítási linket!" });
            return;
        }

        if (password !== confirmPassword) {
            notify("A jelszavak nem egyeznek!", { type: "error", description: "Ellenőrizd a jelszavakat!" });
            return;
        }

        if (password.length < 8) {
            notify("Túl rövid jelszó!", { type: "error", description: "A jelszónak legalább 8 karakter hosszúnak kell lennie!" });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/account/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                notify("Jelszó sikeresen megváltoztatva!", {
                    type: "success",
                    description: "Most már bejelentkezhetsz az új jelszavaddal.",
                });
                router.push("/login");
            } else {
                notify("Hiba történt!", {
                    type: "error",
                    description: data.error || "Próbáld újra később!",
                });
            }
        } catch (error) {
            notify("Hiba történt!", {
                type: "error",
                description: "Hálózati hiba történt. Kérjük próbáld újra később!",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSolving) {
        return (
            <>
                <Head>
                    <title>Jelszó visszaállítása - Studify</title>
                    <meta property="og:title" content="Jelszó visszaállítása - Studify" key="title" />
                </Head>
                <div className="min-h-screen bg-background flex flex-col">
                    <LandingHeader />
                    <main className="flex-1 flex items-center justify-center px-4 py-12">
                        <Card className="w-full max-w-md border-border">
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">Token ellenőrzése...</p>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Jelszó visszaállítása - Studify</title>
                <meta property="og:title" content="Jelszó visszaállítása - Studify" key="title" />
            </Head>
            <div className="min-h-screen bg-background flex flex-col">
                <LandingHeader />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-md border-border">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Új jelszó beállítása</CardTitle>
                            <CardDescription>
                                Add meg az új jelszavadat, amit használni szeretnél.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Új jelszó</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        className="bg-background"
                                        required
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        minLength={8}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        className="bg-background"
                                        required
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                        minLength={8}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!password || password !== confirmPassword || isLoading}
                                    className="bg-green-500 hover:bg-green-600 w-full"
                                >
                                    {isLoading ? "Jelszó módosítása..." : "Jelszó módosítása"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}

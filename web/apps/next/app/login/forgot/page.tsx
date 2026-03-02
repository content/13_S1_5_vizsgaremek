"use client";

import LandingHeader from "@/components/elements/landing-header";
import { useNotificationProvider } from "@/components/notification-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const { notify } = useNotificationProvider();
    const { data: session } = useSession();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session) {
            router.push('/dashboard');
        }
    }, [session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            notify('Hiba', { type: 'error', description: 'Kérjük add meg az email címed!' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/account/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                notify('Email elküldve!', { 
                    type: 'success', 
                    description: 'Ha a megadott email cím létezik, küldtünk rá egy jelszó visszaállítási linket.' 
                });
                setEmail('');
            } else {
                notify('Hiba történt', { 
                    type: 'error', 
                    description: data.error || 'Nem sikerült elküldeni az emailt.' 
                });
            }
        } catch (error) {
            notify('Hiba történt', { 
                type: 'error', 
                description: 'Hálózati hiba történt. Kérjük próbáld újra később!' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Elfelejtett jelszó - Studify</title>
                <meta property="og:title" content="Elfelejtett jelszó - Studify" key="title" />
            </Head>
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header */}
                <LandingHeader />

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-md border-border">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Elfelejtett jelszó</CardTitle>
                            <CardDescription>
                                Add meg az email címed és küldünk egy linket a jelszavad visszaállításához.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email cím</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="Email cím" 
                                        className="bg-background !focus:ring-green-400" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full bg-green-500 hover:bg-green-600 focus:ring-green-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Küldés...' : 'Jelszó visszaállítása'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">Rájöttél a jelszavadra?</span>{" "}
                                <Link href="/login" className="text-green-500 hover:text-green-600 font-medium transition-colors">
                                    Bejelentkezés
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}

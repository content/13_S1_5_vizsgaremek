"use client";

import LandingHeader from "@/components/elements/landing-header";
import { useNotificationProvider } from "@/components/notification-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export function LoginPage() {
    const router = useRouter();

    const { notify } = useNotificationProvider();
    const { data: session } = useSession();

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    useEffect(() => {
        if(session) {
            router.push('/dashboard');
        }
    }, [session])

    const handleLogin = async () => {
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            notify('Sikertelen bejelentkezés!', { type: 'error', description: "Hibás email vagy jelszó" });
        } else {
            notify('Sikeres bejelentkezés!', { type: 'success' });
            router.push('/dashboard');
        }
    };

    return (
        <>
            <Head>
                <title>Bejelentkezés - Studify</title>
                <meta property="og:title" content="Bejelentkezés - Studify" key="title" />
            </Head>
            <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <LandingHeader />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-border">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Üdv újra!</CardTitle>
                        <CardDescription>Jelentkezz be a fiókodba és folytasd, ahol abba hagytad!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="vadkerti-toth.adam@diak.szbi-pg.hu" className="bg-background !focus:ring-green-400" required onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                <Label htmlFor="password">Jelszó</Label>
                                <Link href="#" className="text-sm text-green-500 hover:text-green-600 transition-colors">
                                    Elfelejtetted a jelszavad?
                                </Link>
                                </div>
                                <Input id="password" type="password" placeholder="••••••••" className="bg-background !focus-visible:ring-ring !focus-visible:outline-green-400" required onChange={(e) => setPassword(e.target.value)}/>
                            </div>
                            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 focus:ring-green-600" onClick={(e) => {e.preventDefault(); handleLogin();}}>
                                Bejelentkezés
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">{"Nincs még fiókod?"}</span>{" "}
                            <Link href="/register" className="text-green-500 hover:text-green-600 font-medium transition-colors">
                                Regisztrálj!
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            </div>
        </>
    );
};


export default LoginPage;
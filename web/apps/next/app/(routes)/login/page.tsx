"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import React from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCap } from "lucide-react"

export function LoginPage() {
    const { data: session } = useSession();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');


    const handleLogin = async () => {
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            console.error('Login failed:', result.error);
        } else {
            console.log('Login successful');
        }
    };

    console.log('Session data:', session);

    return (
        <>
            <Head>
                <title>Bejelentkezés - Studify</title>
                <meta property="og:title" content="Bejelentkezés - Studify" key="title" />
            </Head>
            <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-semibold">Studify</span>
                </Link>
                <ThemeToggle />
                </div>
            </header>

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
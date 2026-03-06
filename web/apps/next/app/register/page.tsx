"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import React from "react"

import LandingHeader from "@/components/elements/landing-header"
import { useNotificationProvider } from "@/components/notification-provider"
import { UploadDropzone } from "@/components/uploadthing/uploadthing"
import Head from "next/head"
import { redirect, useRouter } from "next/navigation"

export default function RegisterPage() {
    const router = useRouter();
    const { notify } = useNotificationProvider();

    const [shownCard, setShownCard] = React.useState<"register" | "sent-email">("register");
    const [isLoading, setIsLoading] = React.useState(false);

    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")


    const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);

        try {
            setIsLoading(true);

            const response = await fetch('/api/auth/register/email', {
                method: 'POST',
                body: formData,
            });

            setIsLoading(false);

            switch(response.status) {
                case 200:
                    notify("Megerősítő email elküldve!", { type: "success", description: "Ellenőrizd a postaládádat a megerősítéshez!" });
                    setShownCard("sent-email");
                    break;
                case 400:
                    const data = await response.json();
                    notify("Hiba a regisztráció során!", { type: "error", description: data.error || "Próbáld újra később!" });
                    break;
                case 500:
                    notify("Szerver hiba!", { type: "error", description: "Próbáld újra később!" });
                    break;
                default:
                    notify("Ismeretlen hiba!", { type: "error", description: "Próbáld újra később!" });
                    break;
            }
        } catch (error) {
            notify("Hiba a regisztráció során!", { type: "error", description: "Próbáld újra később!" });
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
    <div className="min-h-screen bg-background flex flex-col">

        {/* Header */}
        <LandingHeader />

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
            {shownCard === "register" && (
                <Card className="w-full max-w-md border-border">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Regisztráció</CardTitle>
                        <CardDescription>Csatlakozz a Studify közösségéhez!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={registerUser}>
                            <div className="grid grid-cols-2 gap-4"> 
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Vezetéknév</Label>
                                    <Input id="firstName" type="text" placeholder="Vezetéknév" className="bg-background" required onChange={(e) => setFirstName(e.target.value)} maxLength={32}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Keresztnév</Label>
                                    <Input id="lastName" type="text" placeholder="Keresztnév" className="bg-background" required onChange={(e) => setLastName(e.target.value)} maxLength={32}/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Email cím" className="bg-background" required onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <Button type="submit" disabled={!firstName || !lastName || !email || isLoading} className="bg-green-500 hover:bg-green-600 w-full">
                                Regisztráció
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Van már fiókod?</span>{" "}
                            <Link href="/login" className="text-green-400 hover:text-green-500 font-medium transition-colors">
                                Jelenkezz be!
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
            {shownCard === "sent-email" && (
                <Card className="w-full max-w-md border-border">
                    <CardHeader className="space-y-1 flex flex-col items-center">
                        <CardTitle className="text-2xl font-bold">Email megerősítés</CardTitle>
                        <CardDescription>Küldtünk egy megerősítő emailt a megadott címre.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">Kérjük, ellenőrizd a postaládádat a regisztráció megerősítéséhez.</p>
                        <p className="text-muted-foreground">Megadott email cím: <span className="text-white">{email}</span></p>
                    </CardContent>
                </Card>
            )}
        </main>
    </div>
    )
}
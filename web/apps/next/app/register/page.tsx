"use client"
import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCap } from "lucide-react"

import { UploadButton, UploadDropzone } from "@/components/uploadthing/uploadthing";
import Head from "next/head"
import { useNotificationProvider } from "@/components/notification-provider"
import { useRouter } from "next/navigation"
import LandingHeader from "@/components/elements/landing-header"

export default function RegisterPage() {
    const router = useRouter();
    const { notify } = useNotificationProvider();

    const [isRegisterBtnDisabled, setIsRegisterBtnDisabled] = React.useState(false)
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [confirmationPassword, setConfirmationPassword] = React.useState("")
    const [profilePicture, setProfilePicture] = React.useState<{path: string | null, name: string | null}>({path: null, name: null})


    const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        formData.append("password", password);
        
        if (profilePicture.path && profilePicture.name) {
            formData.append("profile_picture", profilePicture.path);
            formData.append("profile_picture_file_name", profilePicture.name);
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                body: formData,
            });

            switch(response.status) {
                case 201:
                    notify("Sikeres regisztráció!", { type: "success", description: "Most már bejelentkezhetsz a fiókodba." });
                    router.push("/login");
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
        }
    }

    return (
    <div className="min-h-screen bg-background flex flex-col">
        <Head>
            <title>Regisztráció - Studify</title>
            <meta property="og:title" content="Regisztráció - Studify" key="title" />
        </Head>
        {/* Header */}
        <LandingHeader />

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md border-border">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Regisztráció</CardTitle>
                <CardDescription>Csatlakozz a Studify közösségéhez!</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={registerUser}>
                <div className="grid grid-cols-2 gap-4">
                    
                    <div className="space-y-2">
                    <Label htmlFor="lastName">Vezetéknév</Label>
                    <Input id="lastName" type="text" placeholder="Fülöp" className="bg-background" required onChange={(e) => setLastName(e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="firstName">Keresztnév</Label>
                    <Input id="firstName" type="text" placeholder="Miklós János" className="bg-background" required onChange={(e) => setFirstName(e.target.value)}/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="fulop.miklos.janos@diak.szbi-pg.hu" className="bg-background" required onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" className="bg-background" required onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" className="bg-background" required onChange={(e) => setConfirmationPassword(e.target.value)}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="">Profilkép feltöltése</Label>
                    <UploadDropzone
                        className="border-border bg-background hover:bg-accent/50 transition-colors"
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                            const url = res[0]?.ufsUrl;
                            const name = res[0]?.name;
                            if(url) {
                                notify("Sikeres feltöltés!", { type: "success", description: "A profilképed sikeresen feltöltve." });
                                setProfilePicture({path: res[0]?.ufsUrl || null, name: res[0]?.name || null});
                            }

                            setIsRegisterBtnDisabled(false);
                        }}

                        onUploadProgress={(progress) => {
                            setIsRegisterBtnDisabled(progress < 100);
                        }}

                        onUploadError={(error: Error) => {
                            notify("Hiba a kép feltöltése során!", { type: "error", description: "Próbáld újra később!" });
                            setIsRegisterBtnDisabled(false);
                        }}
                    />
                </div>
                {/* <div className="flex items-start space-x-2">
                    <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-border" required />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-none">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:text-primary/80 transition-colors">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:text-primary/80 transition-colors">
                        Privacy Policy
                    </Link>
                    </label>
                </div> */}
                <Button type="submit" disabled={isRegisterBtnDisabled} className="bg-green-500 hover:bg-green-600 w-full">
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
        </main>
    </div>
    )
}
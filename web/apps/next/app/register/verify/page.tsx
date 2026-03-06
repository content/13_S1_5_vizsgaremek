"use client";

import ProfilePictureUploadButton from "@/components/elements/attachments/profile-picture-upload-button";
import LandingHeader from "@/components/elements/landing-header";
import { useNotificationProvider } from "@/components/notification-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyEmailToken } from "@/lib/encryption/encryption";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { genUploader } from "uploadthing/client";

export default function RegisterVerifiedEmailPage() {
    const searchParams = useSearchParams();

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [isSolving, setIsSolving] = React.useState(true);

    const [token, setToken] = React.useState<string | null>(null);
    const [solvedToken, setSolvedToken] = React.useState<string | null>(null);

    const [shownTab, setShownTab] = React.useState<"password" | "profile_picture">("password");
    const [password, setPassword] = React.useState("");
    const [confirmationPassword, setConfirmationPassword] = React.useState("");

    const [profilePicture, setProfilePicture] = React.useState<{path: string | null, name: string | null}>({path: null, name: null})

    React.useEffect(() => {
        if (profilePicture.path) {
            setIsRegisterBtnDisabled(false);
        }
    }, [profilePicture.path]);

    const [pendingUpload, setPendingUpload] = React.useState<File | null>(null);

    const [isContinueButtonDisabled, setIsContinueButtonDisabled] = React.useState(true);
    const [isRegisterBtnDisabled, setIsRegisterBtnDisabled] = React.useState(false)
    const [sentNotification, setSentNotification] = React.useState(false);

    const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
        if(!token) return;
        event.preventDefault();

        const formData = new FormData();

        if (pendingUpload) {
            setIsRegisterBtnDisabled(true);
            try {
                const { uploadFiles } = genUploader({ fetch: window.fetch });
                const res = await uploadFiles("imageUploader", { files: [pendingUpload] });
                const fileInfo = Array.isArray(res) ? res[0] : res?.[0] ?? res;
                const url = fileInfo?.ufsUrl ?? fileInfo?.url ?? null;
                const name = fileInfo?.name ?? pendingUpload.name;

                if (url) {
                    setProfilePicture({ path: url, name });
                    formData.append("profile_picture", url);
                    formData.append("profile_picture_file_name", name);
                } else {
                    notify("Hiba a kép feltöltése során!", { type: "error", description: "Próbáld újra később!" });
                    setIsRegisterBtnDisabled(false);
                    return;
                }
            } catch (err) {
                console.error("Uploadthing upload error:", err);
                notify("Hiba a kép feltöltése során!", { type: "error", description: "Próbáld újra később!" });
                setIsRegisterBtnDisabled(false);
                return;
            } finally {
                setPendingUpload(null);
            }
        }

        formData.append("token", token);
        formData.append("password", password);

        if (profilePicture.path && profilePicture.name && !formData.has("profile_picture")) {
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
                    setSentNotification(true);
                    redirect("/login");
                case 400:
                    if(sentNotification) return;
                    const data = await response.json();
                    notify("Hiba a regisztráció során!", { type: "error", description: data.error || "Próbáld újra később!" });
                    break;
                case 500:
                    if(sentNotification) return;
                    notify("Szerver hiba!", { type: "error", description: "Próbáld újra később!" });
                    break;
                default:
                    if(sentNotification) return;
                    notify("Ismeretlen hiba!", { type: "error", description: "Próbáld újra később!" });
                    break;
            }
        } catch (error) {
            notify("Hiba a regisztráció során!", { type: "error", description: "Próbáld újra később!" });
            console.error("Registration error:", error);
        } finally {
            setIsRegisterBtnDisabled(false);
        }
    }

    React.useEffect(() => {
        if(!searchParams) return;

        const hashFromParams = searchParams.get("token");
        setToken(hashFromParams);
    }, [searchParams]);

    useEffect(() => {
        setIsContinueButtonDisabled(!password || password !== confirmationPassword);
    }, [password, confirmationPassword]);

    useEffect(() => {
        const solveToken = async () => {
            const solvedToken = await verifyEmailToken(token || "");
            setSolvedToken(solvedToken);
            setIsSolving(false);
        }
        
        solveToken();
    }, [token]);

    useEffect(() => {
        if(!solvedToken && !isSolving) {
            notify("Érvénytelen vagy lejárt token!", { type: "error", description: "Kérjük próbáld meg újra a regisztrációt!" });
            redirect("/register");
        }
    }, [solvedToken]);

    useEffect(() => {
        if(status === "loading") return;

        if(session && session.user !== null) {
            notify("Már be vagy jelentkezve!", { type: "info", description: "Kijelentkezés után próbáld meg újra a regisztrációt!" });
            redirect("/");
        }
    }, [session, status]);

    return (
        <div className="min-h-screen bg-background flex flex-col">

            {/* Header */}
            <LandingHeader />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-border">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Regisztráció</CardTitle>
                        <CardDescription>Fejezd be a regisztrációt!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={registerUser}>
                            {shownTab === "password" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Jelszó</Label>
                                        <Input id="password" type="password" placeholder="••••••••" value={password} className="bg-background" required onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
                                        <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmationPassword} className="bg-background" required onChange={(e) => setConfirmationPassword(e.target.value)}/>
                                    </div>
                                    <Button disabled={!password || password !== confirmationPassword} className="bg-green-500 hover:bg-green-600 w-full" onClick={() => setShownTab("profile_picture")}>
                                        Tovább
                                    </Button>
                                </>
                                
                            )}
                            {shownTab === "profile_picture" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="">Profilkép feltöltése</Label>
                                        <div className="w-full flex items-center justify-center gap-4">
                                            <ProfilePictureUploadButton
                                                className="border-border bg-background hover:bg-accent/50 transition-colors size-32"
                                                onUpload={(file: File) => {
                                                   
                                                    setPendingUpload(file);

                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        setProfilePicture({ path: String(reader.result), name: file.name });
                                                    };
                                                    reader.readAsDataURL(file);
                                                    
                                                    setIsRegisterBtnDisabled(false);
                                                }}
                                                defaultImage={profilePicture.path || undefined}
                                            />
                                        </div>
                                 </div>
                                    <div className="flex justify-between">
                                        <Button 
                                            variant={"outline"}
                                            className="" 
                                            onClick={() => setShownTab("password")}
                                        >
                                            Vissza
                                        </Button>
                                        <Button 
                                            variant={"default"}
                                            type="submit" 
                                            disabled={isRegisterBtnDisabled} 
                                            className="bg-green-500 hover:bg-green-600"
                                        >
                                            Regisztráció
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
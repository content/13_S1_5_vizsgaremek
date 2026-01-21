"use client";

import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Calendar, GraduationCap, Home, Menu, Plus, Settings, Users, X } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import React, { useEffect } from "react"
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { createCourse, joinCourse } from "@/lib/dashboard/courseFuntions";
import { useNotificationProvider } from "./notification-provider";
import { UploadDropzone } from "./uploadthing/uploadthing";

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
    const { notify } = useNotificationProvider();
    const { data: session } = useSession();
    
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [joinDialogOpen, setJoinDialogOpen] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [name, setName] = React.useState<string | null>(null);
    const [monogram, setMonogram] = React.useState("");
    const [profilePictureUrl, setProfilePictureUrl] = React.useState<string>("");
    
    const [isNewCourseCreateBtnDisabled, setIsNewCourseCreateBtnDisabled] = React.useState(false);

    const [newCourseName, setNewCourseName] = React.useState("");
    const [newCourseBackgroundImageUrl, setNewCourseBackgroundImageUrl] = React.useState<string | null>(null);
    const [invitationCode, setInvitationCode] = React.useState("");

    const navItems = [
        { icon: Home, label: "Kurzusaid", href: "/dashboard", active: true },
        { icon: Calendar, label: "Naptár", href: "/calendar", active: false },
        { icon: Settings, label: "Beállítások", href: "/settings", active: false },
    ];

    const handleCreateCourse = async () => {
        if(!session || !session.user) return;

        const newCourse = await createCourse(session.user.id, newCourseName, newCourseBackgroundImageUrl);
        switch(newCourse) {
            case null:
                console.error("Failed to create course");
                notify("Hiba történt a kurzus létrehozásakor.", { type: "error" });
                return;
            default:
                notify("Kurzus sikeresen létrehozva!", { type: "success" })
                break;
        }

        session.user.courses.push(newCourse);
        setCreateDialogOpen(false);
    }
    
    const handleJoinCourse = async () => {
        if(!session || !session.user) return;

        const joinedCourse = await joinCourse(session.user.id, invitationCode);

        switch(joinedCourse) {
            case null:
                console.error("Failed to join course");
                notify("Hiba történt a kurzushoz való csatlakozáskor.", { type: "error" });
                return;
            default:
                notify("Sikeresen csatlakoztál a kurzushoz!", { type: "success" });
                break;
        }

        session.user.courses.push(joinedCourse);
        setJoinDialogOpen(false);
    }

    useEffect(() => {
        if(!session || !session.user) return;

        const firstName = session.user.first_name;
        const lastName = session.user.last_name;
        setName(`${firstName} ${lastName}`);

        const allNames = [...firstName.split(" "), ...lastName.split(" ")];
        const monogramLetters: string[] = [];
        
        allNames.forEach((n) => {
            if(n.length > 0 && monogramLetters.length < 2) {
                monogramLetters.push(n[0].toUpperCase());
            }
        });

        setMonogram(monogramLetters.join(""));
        setProfilePictureUrl(session.user.profile_picture || "");
    }, [session]);

    return (
        <div className="min-h-screen bg-background flex">
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex flex-col h-full">
                <div className="h-16 flex items-center justify-between px-4 border-b border-border lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-green-400-foreground" />
                    </div>
                    <span className="text-xl font-semibold">Studify</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        item.active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-center gap-3 px-3 py-2 text-sm opacity-50">
                        &copy; 2026 Studify
                    </div>
                </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="hidden lg:flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-green-400-foreground" />
                            </div>
                            <span className="text-xl font-semibold">Studify</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setJoinDialogOpen(true)}>
                                    <Users className="h-4 w-4 mr-2" />
                                    Kurzus csatlakozás
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Kurzus létrehozása
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <ThemeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={profilePictureUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm">{monogram}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{ name }</p>
                                    <p className="text-xs text-muted-foreground">{ session?.user?.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">Beállítások</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" onClick={() => signOut()}>Kijelentkezés</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Kurzus létrehozása</DialogTitle>
                                <DialogDescription>
                                    Töltsd ki az adatokat egy új kurzus létrehozásához. Később meghívhatod a diákokat.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course-name">Kurzus neve</Label>
                                    <Input id="course-name" placeholder="Matematika" onChange={(e) => setNewCourseName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course-background-image-url">Kurzus háttérképe</Label>
                                        <UploadDropzone
                                            className="border-border bg-background hover:bg-accent/50 transition-colors"
                                            endpoint="imageUploader"
                                            onClientUploadComplete={(res) => {
                                                const url = res[0]?.ufsUrl;
                                                if(url) {
                                                    notify("Sikeres feltöltés!", { type: "success", description: "A háttérkép sikeresen feltöltve." });
                                                    setNewCourseBackgroundImageUrl(res[0]?.ufsUrl);
                                                }
                    
                                                setIsNewCourseCreateBtnDisabled(false);
                                            }}
                    
                                            onUploadProgress={(progress) => {
                                                setIsNewCourseCreateBtnDisabled(progress < 100);
                                            }}
                    
                                            onUploadError={(error: Error) => {
                                                notify("Hiba a kép feltöltése során!", { type: "error", description: "Próbáld újra később!" });
                                                setIsNewCourseCreateBtnDisabled(false);
                                            }}
                                        />
                                    
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                    Mégse
                                </Button>
                                <Button disabled={isNewCourseCreateBtnDisabled} onClick={() => handleCreateCourse()}>
                                        Kurzus létrehozása
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Csatlakozz egy kurzushoz!</DialogTitle>
                                <DialogDescription>
                                    Írd be a kurzuskódot az alábbi mezőbe a csatlakozáshoz.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course-code">Kurzus kódja</Label>
                                    <Input id="course-code" placeholder="ABC123" className="font-mono" onChange={(e) => setInvitationCode(e.target.value)}/>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Kérd el a tanárodtól vagy társaidtól a kurzuskódot, és írd be ide. A kurzuskódok általában 6-7
                                    karakterből állnak.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
                                    Mégse
                                </Button>
                                <Button onClick={() => handleJoinCourse()}>
                                    Csatlakozás
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {children}
                </main>
            </div>
        </div>
    )
}
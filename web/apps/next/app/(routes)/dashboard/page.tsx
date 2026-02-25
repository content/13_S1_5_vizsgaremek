"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Course } from "@studify/types";
import { BookOpen, Users } from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
"next/link";

import CourseCard from "@/components/elements/course-card";

import { useNotificationProvider } from "@/components/notification-provider";
import { UploadDropzone } from "@/components/uploadthing/uploadthing";
import { createCourse, joinCourse } from "@/lib/dashboard/utils";

export default function DashboardPage() {
    const router = useRouter();

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();
    
    const [courses, setCourses] = useState<Course[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseBackgroundImageUrl, setNewCourseBackgroundImageUrl] = useState("");
    const [isNewCourseCreateBtnDisabled, setIsNewCourseCreateBtnDisabled] = useState(false);

    const [invitationCode, setInvitationCode] = useState("");

    useEffect(() => {
        document.title = "Dashboard - Studify";
    }, [])

    useEffect(() => {
        if(status === "loading") return;

        if(!session || !session.user) {
            router.push('/login');
            return;
        }

        setCourses(session.user.courses || []);
        setIsLoading(false);
    }, [session, status, router]);

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

        setCourses([...courses, newCourse]);
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

        setCourses([...courses, joinedCourse]);
        setJoinDialogOpen(false);
    }

    return (
        isLoading ? (
            <div>
                <p>Betöltés...</p>
            </div>
        ) : (
            courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="mb-8 relative">
                        <div className="w-64 h-48 relative">
                        <div className="absolute inset-0 border-2 border-border rounded-lg bg-card">
                            <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 gap-2">
                            <div className="bg-muted rounded" />
                            <div className="bg-muted rounded" />
                            <div className="bg-muted rounded" />
                            <div className="bg-muted rounded" />
                            </div>
                        </div>
                        <div className="absolute -bottom-4 left-8 w-24 h-6 bg-green-600 rounded transform -rotate-6" />
                        <div className="absolute -bottom-2 left-12 w-20 h-4 bg-muted rounded transform rotate-3" />
                        <div className="absolute top-4 -right-4 w-8 h-12 bg-indigo-600/50 rounded" />
                        <div className="absolute top-8 -right-8 w-6 h-8 bg-green-900/75 rounded" />
                        <div className="absolute bottom-12 -left-4 w-6 h-6 rounded-full bg-yellow-400" />
                        <div className="absolute top-16 -left-2 w-4 h-4 rounded-full bg-yellow-500" />
                        </div>
                    </div>

                    <h2 className="text-xl font-medium text-foreground mb-2">Kezdd el a tanulást!</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Hozz létre saját kurzust a tanítás megkezdéséhez, vagy csatlakozz egy meglévő kurzushoz a kapott kóddal.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 bg-transparent">
                                    <BookOpen className="h-4 w-4" />
                                    Kurzus létrehozása
                                </Button>
                            </DialogTrigger>
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
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-green-500 hover:bg-green-600">
                                    <Users className="h-4 w-4" />
                                    Csatlakozz egy kurzushoz
                                </Button>
                            </DialogTrigger>
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
                                        <Input id="course-code" placeholder="ABC123" className="font-mono" onChange={(e) => setInvitationCode(e.target.value)} />
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
                    </div>
                </div>
            ) : (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pe-36">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>
            )
        )
    );
}
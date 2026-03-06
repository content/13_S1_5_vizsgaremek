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
import {
    useCourseCreated,
    useCourseDeleted,
    useCourseMemberJoin,
    useCourseMemberLeave,
} from "@/hooks/use-websocket-events";
import { UploadDropzone } from "@/components/uploadthing/uploadthing";
import { createCourse, joinCourse } from "@/lib/dashboard/utils";
import CreateNewCourseDialog from "@/components/elements/dashboard/createNewCourseDialog";
import { genUploader } from "uploadthing/client";

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

    useCourseCreated((course) => {
        const currentUserId = session?.user?.id;
        if (!currentUserId) return;

        const hasCurrentUser = (course as any)?.members?.some((member: any) => member.user.id === currentUserId);
        if (!hasCurrentUser) return;

        setCourses((prev) => {
            if (prev.some((c) => c.id === course.id)) return prev;
            return [...prev, course as Course];
        });
    }, [session?.user?.id]);

    useCourseMemberJoin((payload) => {
        const currentUserId = session?.user?.id;
        if (!currentUserId) return;

        if (payload?.member?.user?.id !== currentUserId) return;

        setCourses((prev) => {
            if (prev.some((c) => c.id === payload.course.id)) return prev;
            return [...prev, payload.course as Course];
        });
    }, [session?.user?.id]);

    useCourseMemberLeave((payload) => {
        const currentUserId = session?.user?.id;
        if (!currentUserId) return;

        if (payload.userId !== currentUserId) return;

        setCourses((prev) => prev.filter((course) => course.id !== payload.courseId));
    }, [session?.user?.id]);

    useCourseDeleted((payload) => {
        setCourses((prev) => prev.filter((course) => course.id !== payload.courseId));
    }, []);

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

    const handleBannerUpload = async (file: File) => {
        setIsNewCourseCreateBtnDisabled(true);
        try {
            const { uploadFiles } = genUploader({ fetch: window.fetch });
            const res = await uploadFiles("imageUploader", { files: [file] });
            const fileInfo = Array.isArray(res) ? res[0] : res?.[0] ?? res;
            const url = fileInfo?.ufsUrl ?? fileInfo?.url ?? null;
            if (url) {
                setNewCourseBackgroundImageUrl(url);
            }
        } catch (err) {
            console.error("Banner upload error:", err);
        } finally {
            setIsNewCourseCreateBtnDisabled(false);
        }
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
                        </div>
                    </div>

                    <h2 className="text-xl font-medium text-foreground mb-2">Kezdd el a tanulást!</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Hozz létre saját kurzust a tanítás megkezdéséhez, vagy csatlakozz egy meglévő kurzushoz a kapott kóddal.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
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
                                        <Input id="course-code" placeholder="ABC123" className="font-mono" onChange={(e) => setInvitationCode(e.target.value)} maxLength={9}/>
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
"use client";

import { useNotificationProvider } from "@/components/notification-provider";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

import { Course, Submission, Post, CourseMember } from "@studify/types";
import { useRouter } from "next/navigation";
import CourseBanner from "@/components/elements/course-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Notebook } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SubmissionCard from "@/components/elements/submissions/submission-card";

export default function SubmissionsPage({ params }: { params: Promise<{ courseId: string, postId: string }> }) {
    const { courseId, postId } = React.use(params);

    const router = useRouter();

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession(); 

    const [course, setCourse] = React.useState<Course | null>(null);
    const [post, setPost] = React.useState<Post | null>(null);
    const [submissions, setSubmissions] = React.useState<Submission[]>([]);
    const [submittedSubmissions, setSubmittedSubmissions] = React.useState<Submission[]>([]);
    const [isUserTeacher, setIsUserTeacher] = React.useState<boolean>(false);

    const tabs = [
        { id: "course", label: "Vissza a kurzushoz", icon: Home, href: `/dashboard/${courseId}` },
        { id: "post", label: "Vissza a feladathoz", icon: Notebook, href: `/dashboard/${courseId}/${postId}` }
    ];

    useEffect(() => {
        if(status === "loading") return;

        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            router.push("/login");
            return;
        }

        const userCourse = session.user.courses.find((c: Course) => c.id === +courseId);
        if(!userCourse) {
            notify("Nincs hozzáférésed ehhez a kurzushoz!", { type: "error" });
            router.push("/dashboard");
            return;
        }
        
        const userPost = userCourse.posts.find((p: Post) => p.id === +postId);
        if(!userPost) {
            notify("Nincs hozzáférésed ehhez a feladathoz!", { type: "error" });
            router.push(`/dashboard/${courseId}`);
            return;
        }

        const teachers = userCourse.members.filter((m: CourseMember) => m.isTeacher);
        const isUserTeacher = teachers.some((t: CourseMember) => t.user.id === session.user?.id);

        if(!isUserTeacher) {
            notify("Nincs jogosultságod megtekinteni a beadott feladatokat!", { type: "error" });
            router.push(`/dashboard/${courseId}/${postId}`);
            return;
        }

        const submittedSubmissionz = userPost.submissions.filter((s: Submission) => s.status.name === "SUBMITTED");
        
        console.log(userPost.submissions);

        setCourse(userCourse);
        setPost(userPost);
        setIsUserTeacher(isUserTeacher);
        setSubmittedSubmissions(submittedSubmissionz);
        setSubmissions(userPost.submissions);
    }, [session, status, router, courseId, postId]);

    return ( 
        !session || !course || !post || !isUserTeacher ? (
            <div className="flex flex-col gap-2">
                <Skeleton className="h-48 md:h-64 lg:h-64 2xl:h-64 mb-6 rounded-lg" />
                <div>
                    <div className="mt-6 mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] xl:grid-cols-[3fr_1fr] gap-6">
                        <Skeleton className="h-96 w-full rounded-lg mb-4" />
                        <div className="flex flex-col gap-3">
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <CourseBanner course={course} />

                <div className="mt-6 mx-auto w-full max-w-6xl space-y-6">
                    <Card className="p-4 rounded-lg">
                        <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
                            {tabs.map((tab) => (
                                <Link href={tab.href} key={tab.id}>
                                    <Button 
                                        key={tab.id} 
                                        variant="ghost" 
                                        className={`flex items-center space-x-2`}
                                    >
                                        <tab.icon className={`h-5 w-5`} />
                                        <span>{tab.label}</span>
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </Card>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr] gap-6">
                        <div className="flex flex-col gap-4">
                            <Card>
                                <CardHeader className="flex flex-col items-center">
                                    <CardTitle className="text-xxl">
                                        {submittedSubmissions.length}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        beadott feladat
                                    </p>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-col items-center">
                                    <CardTitle className="text-xxl">
                                        {submissions.length - submittedSubmissions.length}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        kiosztott feladat
                                    </p>
                                </CardHeader>
                            </Card>
                        </div>
                        <div className="flex flex-col gap-4">
                            {submissions.map((submission) => (
                                <SubmissionCard key={submission.id} href={`/dashboard/${courseId}/${postId}/submissions/${submission.id}`} submission={submission} post={post} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}
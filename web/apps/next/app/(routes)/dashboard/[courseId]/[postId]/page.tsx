"use client";

import AttachmentUploadCard from "@/components/elements/attachments/attachment-upload-card";
import SubmissionAttachmentCard from "@/components/elements/attachments/submission-attachment-card";
import CourseBanner from "@/components/elements/course-banner";
import PostDetailsCard from "@/components/elements/posts/post-details-card";
import { useNotificationProvider } from "@/components/notification-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadDropzone } from "@/components/uploadthing/uploadthing";
import { Course, CourseMember, Post, Submission, User } from "@studify/types";
import {
    useCourseDeleted,
    useCourseMemberLeave,
    useSubmissionCreated,
    useSubmissionEdited,
    useSubmissionGraded,
    useSubmissionSubmitted,
    useSubmissionUnsubmitted,
} from "@/hooks/use-websocket-events";
import { formatInTimeZone } from 'date-fns-tz';
import { Home } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import PostMessagesDialog from "@/components/elements/posts/messages/messages-dialog";

export default function PostPage({ params }: { params: Promise<{ courseId: string, postId: string }> }) {
    const { courseId, postId } = React.use(params);

    const router = useRouter();

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [course, setCourse] = React.useState<Course | null>(null);
    const [isUserTeacher, setIsUserTeacher] = React.useState<boolean>(false);
    const [post, setPost] = React.useState<Post | null>(null);
    const [postType, setPostType] = React.useState<string | null>(null);

    const [submission, setSubmission] = React.useState<Submission | null>(null);
    const [submissionAttachmentAdditions, setSubmissionAttachmentAdditions] = React.useState<Map<string, [string, string]>>(new Map());
    const [isSubmittingBtnDisabled, setIsSubmittingBtnDisabled] = React.useState<boolean>(false);
    const [isAddSubmissionAttachmentDialogOpen, setIsAddSubmissionAttachmentDialogOpen] = React.useState<boolean>(false);
    const [deadlineAt, setDeadlineAt] = React.useState<Date | null>(null);

    const [isMessagesDialogOpen, setIsMessagesDialogOpen] = React.useState<boolean>(false);

    const upsertPostSubmission = React.useCallback((incomingSubmission: Submission) => {
        setPost((prevPost) => {
            if (!prevPost) return prevPost;
            if(!prevPost.submissions) prevPost.submissions = [];

            const existingIndex = prevPost.submissions.findIndex((submission) => submission.id === incomingSubmission.id);
            if (existingIndex === -1) {
                return { ...prevPost, submissions: [...prevPost.submissions, incomingSubmission] };
            }

            const updatedSubmissions = [...prevPost.submissions];
            updatedSubmissions[existingIndex] = incomingSubmission;
            return { ...prevPost, submissions: updatedSubmissions };
        });

        if (incomingSubmission.student?.id === session?.user?.id) {
            setSubmission(incomingSubmission);
        }
    }, [session?.user?.id]);

    useSubmissionCreated((payload) => {
        if (+payload.postId !== +postId) return;
        upsertPostSubmission(payload.submission as Submission);
    }, [postId, upsertPostSubmission]);

    useSubmissionEdited((payload) => {
        if (+payload.postId !== +postId) return;
        upsertPostSubmission(payload.submission as Submission);
    }, [postId, upsertPostSubmission]);

    useSubmissionSubmitted((payload) => {
        if (+payload.postId !== +postId) return;
        upsertPostSubmission(payload.submission as Submission);
    }, [postId, upsertPostSubmission]);

    useSubmissionUnsubmitted((payload) => {
        if (+payload.postId !== +postId) return;
        upsertPostSubmission(payload.submission as Submission);
    }, [postId, upsertPostSubmission]);

    useSubmissionGraded((payload) => {
        if (+payload.postId !== +postId) return;
        upsertPostSubmission(payload.submission as Submission);
    }, [postId, upsertPostSubmission]);

    useCourseMemberLeave((payload) => {
        if (+payload.courseId !== +courseId) return;
        if (payload.userId !== session?.user?.id) return;

        notify("Eltávolítottak a kurzusból.", { type: "warning" });
        router.push("/dashboard");
    }, [courseId, session?.user?.id, notify, router]);

    useCourseDeleted((payload) => {
        if (+payload.courseId !== +courseId) return;

        notify("A kurzus törölve lett.", { type: "warning" });
        router.push("/dashboard");
    }, [courseId, notify, router]);

    const tabs = [
        { id: "course", label: "Vissza a kurzushoz", icon: Home, href: `/dashboard/${courseId}` },
    ];
    
    const handleSubmissionUnsubmit = async () => {
        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            router.push("/login");
            return;
        }

        if(!submission) {
            notify("Nincs leadott munkád ehhez a feladathoz!", { type: "error" });
            return;
        }

        const response = await fetch(`/api/submissions/unsubmit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: session.user.id,
                postId: +postId,
                submissionId: +submission.id
            })
        });

        switch(response.status) {
            case 200:
                const data = await response.json();
                setSubmission(data);
                notify("Sikeres leadás visszavonás!", { type: "success", description: "A munkád leadása sikeresen visszavonva." });
                break;
            case 400:
                notify("A beadás nincs leadva ehhez a feladathoz!", { type: "error" });
                break;
            case 403:
                notify("Nincs jogosultságod ehhez a művelethez!", { type: "error" });
                break;
            default:
                notify("Hiba történt a művelet során!", { type: "error", description: "Próbáld újra később!" });
                break;
        }
    }

    const handleSubmissionSubmit = async () => {
        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            router.push("/login");
            return;
        }

        if(!submission) {
            notify("Nincs leadott munkád ehhez a feladathoz!", { type: "error" });
            return;
        }

        const response = await fetch(`/api/submissions/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: session.user.id,
                postId: +postId,
                submissionId: +submission.id
            })
        });
        
        switch(response.status) {
            case 200:
                const data = await response.json();
                setSubmission(data);
                notify("Sikeres beadás!", { type: "success", description: "A munkád sikeresen leadva." });
                break;
            case 400:
                notify("Már leadtad ezt a feladatot!", { type: "error" });
                break;
            case 403:
                notify("Nincs jogosultságod ehhez a művelethez!", { type: "error" });
                break;
            default:
                notify("Hiba történt a művelet során!", { type: "error", description: "Próbáld újra később!" });
                break;
        }
    }

    const handleSubmissionAttachmentAdd = async () => {
        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            router.push("/login");
            return;
        }
        
        const endpoint = submission ? "edit" : "create";
        const attachmentz = Array.from(submissionAttachmentAdditions.entries()).map(([name, [url, _type]]) => ({path: url, name: name}));

        const response = await fetch(`/api/submissions/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: session?.user?.id,
                postId: +postId,
                submissionId: submission ? +submission.id : undefined,
                attachments: [submission ? submission.attachments.map((att: any) => ({path: att.path, name: att.fileName})) : [], ...attachmentz].flat()
            })
        });

        switch(response.status) {
            case 201:
            case 200:
                const data = await response.json();
                setSubmission(data);
                notify("Sikeres hozzáadás!", { type: "success", description: "A munkád sikeresen hozzáadva." });
                setSubmissionAttachmentAdditions(new Map());
                setIsAddSubmissionAttachmentDialogOpen(false);
                break;
            case 403:
                notify("Nincs jogosultságod ehhez a művelethez!", { type: "error" });
                break;
            default:
                notify("Hiba történt a művelet során!", { type: "error", description: "Próbáld újra később!" });
                break;
        }
    }

    const handleSubmissionAttachmentRemove = async (name: string, url: string) => {
        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            router.push("/login");
            return;
        }

        if(!submission) {
            notify("Nincs leadott munkád ehhez a feladathoz!", { type: "error" });
            return;
        }
        
        const attachment = submission.attachments.find((att: any) => att.fileName === name && att.path === url);
        if(!attachment) {
            notify("A megadott melléklet nem található a leadott munkádban!", { type: "error" });
            return;
        }

        const newAttachments = submission.attachments.filter((att: any) => att.fileName !== name || att.path !== url);
        
        const response = await fetch(`/api/submissions/edit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: session?.user?.id,
                postId: +postId,
                submissionId: +submission.id,
                attachments: newAttachments.map((att: any) => ({path: att.path, name: att.fileName}))
            })
        });

        switch(response.status) {
            case 200:
                const data = await response.json();
                setSubmission(data);
                notify("Sikeres eltávolítás!", { type: "success", description: "A melléklet sikeresen eltávolítva." });
                break;
            case 403:
                notify("Nincs jogosultságod ehhez a művelethez!", { type: "error" });
                break;
            default:
                notify("Hiba történt a művelet során!", { type: "error", description: "Próbáld újra később!" });
                break;
        }
    }

    React.useEffect(() => {
        if (status === "loading") {
            return;
        }

        if(!session || !session.user) {
            router.push("/login")
            return;
        }

        const tmpCourse = session.user.courses.find((c: Course) => c.id === +courseId);
        if (!tmpCourse) {
            notify("Nincs hozzáférésed ehhez a kurzushoz.", { type: "error" });
            router.push("/dashboard");
            return;
        }

        const tmpPost = tmpCourse.posts.find((p: Post) => p.id === +postId);
        if (!tmpPost) {
            notify("A bejegyzés nem található.", { type: "error" });
            router.push(`/dashboard/${courseId}`);
            return;
        }

        const teachers = tmpCourse.members.filter((cu: CourseMember) => cu.isTeacher);

        setIsUserTeacher(teachers.some((t: CourseMember) => t.user.id === session.user?.id));
        setCourse(tmpCourse);
        setPost(tmpPost);
        setPostType(tmpPost.postType?.name);
        setSubmission(tmpPost.submissions?.find((s: Submission) => s.student.id === session.user?.id) || null);
        setDeadlineAt(tmpPost.deadlineAt ? new Date(tmpPost.deadlineAt) : null);
    }, [session, status, router, courseId, postId]);

    useEffect(() => {
        if(!submission) return;

        submission.attachments = submission.attachments.map((attachment: any) => {
            const name = attachment.fileName;
            const extension = name.split('.').pop()?.toLowerCase() || '';

            let type = 'file';
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
                type = 'image/jpeg';
            } else if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
                type = 'video/mp4';
            } else if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) {
                type = 'audio/mpeg';
            } else if (['pdf'].includes(extension)) {
                type = 'application/pdf';
            }
            
            return {...attachment, type };
        });
    }, [submission])

    const onMessageDialogClose = () => {
        setIsMessagesDialogOpen(false);
    }

    return (
        !course || !post ? (
        <div className="flex flex-col gap-2">
            <Skeleton className="h-48 md:h-64 lg:h-64 2xl:h-64 mb-6 rounded-lg" />
            <div>
                <div className="mt-6 mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] xl:grid-cols-[3fr_1fr] gap-6">
                    <Skeleton className="h-96 w-full rounded-lg mb-4" />
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-32 w-full rounded-lg mb-4" />
                        <Skeleton className="h-36 w-full rounded-lg mb-4" />
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
                <div className={`mt-6 mx-auto w-full max-w-6xl grid grid-cols-1 ${!["ANNOUNCEMENT", "RESOURCE"].includes(postType || "") ? "lg:grid-cols-[2fr_1fr] xl:grid-cols-[3fr_1fr]" : ""} gap-6`}>
                    <PostDetailsCard course={course} post={post} submission={submission || undefined}></PostDetailsCard>
                    {!["ANNOUNCEMENT", "RESOURCE"].includes(postType || "") && (
                    <div className="flex flex-col gap-3">
                        <Card className="p-2">
                            <div className="p-4 flex flex-col gap-2 justify-end">
                                {isUserTeacher && (
                                    <div>
                                        <h3 className="flex justify-center font-semibold mb-2">Feladatok kezelése</h3>
                                        <p className="text-sm text-center text-muted-foreground mb-5">Tekintsd meg és értékeld a beadott feladatokat!</p>
                                        <div className="flex flex-col gap-2">
                                            <Link href={`/dashboard/${courseId}/${postId}/submissions`} className="w-full">
                                                <Button
                                                    variant={"outline"}
                                                    className="w-full"
                                                >
                                                    Megtekintés és értékelés
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                {!isUserTeacher && (
                                    <div>
                                        <h3 className="flex justify-center font-semibold mb-2">Feladat beadása</h3>
                                        {!submission || submission.attachments?.length === 0 && (
                                            <p className="text-sm text-center text-muted-foreground mb-5">Még nem adtál le munkát erre a feladatra.</p>
                                        )}
                                        {submission && submission.attachments?.length !== 0 && (
                                            <div className="flex flex-col gap-2">
                                                {submission.attachments?.map((attachment: any, index: number) => (
                                                    <SubmissionAttachmentCard 
                                                        key={`SUBMISSION_ATTACHMENT_${index}`}
                                                        name={attachment.fileName}
                                                        url={attachment.path}
                                                        showRemoveButton={!["SUBMITTED", "GRADED"].includes(submission.status.name)}
                                                        onRemove={(name: string, url: string) => handleSubmissionAttachmentRemove(name, url)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {(!submission || (submission && !["SUBMITTED", "GRADED"].includes(submission.status?.name))) && (
                                        <Dialog open={isAddSubmissionAttachmentDialogOpen} onOpenChange={(open) => setIsAddSubmissionAttachmentDialogOpen(open)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => setIsAddSubmissionAttachmentDialogOpen(true)}
                                                    variant={"outline"}
                                                    className="w-full mb-2"
                                                >
                                                    Munka hozzáadása
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl w-full">
                                                <DialogTitle>
                                                    Munka hozzáadása
                                                </DialogTitle>
                                                <div className="">
                                                    <UploadDropzone
                                                        className="border-border bg-background hover:bg-accent/50 transition-colors"
                                                        endpoint="fileUploader"
                                                        onClientUploadComplete={(res) => {
                                                            for (const file of res) {
                                                                const name = file?.name;
                                                                const url = file?.ufsUrl;
                                                                const type = file?.type;
                                                                
                                                                if(url && name) {
                                                                    notify("Sikeres feltöltés!", { type: "success", description: "A profilképed sikeresen feltöltve." });
                                                                
                                                                    setSubmissionAttachmentAdditions(prev => new Map(prev).set(name, [url, type]));
                                                                }
                                                            }
                                                            setIsSubmittingBtnDisabled(false);
                                                        }}
                                
                                                        onUploadProgress={(progress) => {
                                                            setIsSubmittingBtnDisabled(progress < 100);
                                                        }}
                                
                                                        onUploadError={(error: Error) => {
                                                            notify("Hiba a kép feltöltése során!", { type: "error", description: "Próbáld újra később!" });
                                                            console.error(error);
                                                            setIsSubmittingBtnDisabled(false);
                                                        }}
                                                    />
                                                    <div className="mt-4">
                                                        {Array.from(submissionAttachmentAdditions.entries()).map(([name, [url, type]]) => (
                                                            <AttachmentUploadCard key={`ATTACHMENT_UPLOADED_${name}`} name={name} url={url} type={type} onRemove={(name) => {
                                                                setSubmissionAttachmentAdditions(prev => {
                                                                    const newAttachments = new Map(prev);
                                                                    newAttachments.delete(name);
                                                                    return newAttachments;
                                                                });
                                                            }} />
                                                        ))}
                                                    </div>
                                                    
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => handleSubmissionAttachmentAdd()}
                                                        disabled={isSubmittingBtnDisabled}
                                                    >
                                                        Hozzáadás
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        )}
                                        
                                        {(submission && !["SUBMITTED", "GRADED"].includes(submission.status?.name) && (
                                        <Button
                                            className="mt-5 w-full"
                                            onClick={() => handleSubmissionSubmit()}
                                            disabled={submissionAttachmentAdditions.size > 0 || post.deadlineAt && new Date(post.deadlineAt) < new Date() || false}
                                        >
                                            Beadás
                                        </Button>
                                        ))}
                                        {(submission && submission.status?.name === "SUBMITTED") && (
                                        <Button
                                            className="mt-5 w-full"
                                            onClick={() => handleSubmissionUnsubmit()}
                                            disabled={submissionAttachmentAdditions.size > 0 || (post.deadlineAt && new Date(post.deadlineAt) < new Date()) || false}
                                        >
                                            Beadás visszavonása
                                        </Button>
                                        )}
                                        {(submission && submission.status?.name === "GRADED") && (
                                        <Button
                                            className="mt-5 w-full "
                                            disabled
                                        >
                                            Osztályozva
                                        </Button>
                                        )}
                                        {post.deadlineAt && (
                                            <div className="text-center text-muted-foreground pt-3 flex flex-col">
                                                Határidő: 
                                                <span>{formatInTimeZone(new Date(post.deadlineAt), 'Europe/Budapest', 'yyyy/MM/dd HH:mm:ss')}</span>
                                            </div>
                                        )}
                                        
                                  </div>
                                )}
                            </div>
                        </Card>
                        {!isUserTeacher && session && session.user && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <h3 className="text-lg">Privát üzenetek</h3>
                                    <p className="text-sm text-muted-foreground font-normal">Kérdezz a feladattal kapcsolatban!</p>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PostMessagesDialog
                                    sender={
                                        {
                                            ...session.user,
                                            created_at: new Date((session.user as any).created_at)
                                        } as User
                                    }
                                    receiver={
                                        (() => {
                                            const teacherMember = course.members.find((m: CourseMember) => m.isTeacher);
                                            
                                            if (!teacherMember) return undefined as any;
                                            
                                            return {
                                                ...teacherMember.user,
                                                created_at: new Date((teacherMember.user as any).created_at)
                                            } as User;
                                        })()
                                    }
                                    post={post}
                                    isOpen={isMessagesDialogOpen}
                                    onClose={onMessageDialogClose}
                                >
                                    <Button
                                        variant={"default"}
                                        className="w-full"
                                        onClick={() => setIsMessagesDialogOpen(true)}
                                    >
                                        Üzenetek megtekintése
                                    </Button>        
                                </PostMessagesDialog>
                                
                            </CardContent>
                        </Card>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </div>
        )
    );
}
"use client";

import AttachmentUploadCard from "@/components/elements/attachments/attachment-upload-card";
import SubmissionAttachmentCard from "@/components/elements/attachments/submission-attachment-card";
import CourseBanner from "@/components/elements/course-banner";
import PostDetailsCard from "@/components/elements/posts/post-details-card";
import { useNotificationProvider } from "@/components/notification-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadDropzone } from "@/components/uploadthing/uploadthing";
import { generateColorFromInvitationCode } from "@/lib/dashboard/utils";
import { Course, Post, Submission } from "@studify/types";
import { set } from "date-fns";
import { Home } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function PostPage({ params }: { params: Promise<{ courseId: string, postId: string }> }) {
    const { courseId, postId } = React.use(params);

    const router = useRouter();

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [course, setCourse] = React.useState<Course | null>(null);
    const [post, setPost] = React.useState<Post | null>(null);
    const [postType, setPostType] = React.useState<string | null>(null);

    const [submission, setSubmission] = React.useState<Submission | null>(null);
    const [submissionAttachmentAdditions, setSubmissionAttachmentAdditions] = React.useState<Map<string, [string, string]>>(new Map());
    const [isSubmittingBtnDisabled, setIsSubmittingBtnDisabled] = React.useState<boolean>(false);

    const tabs = [
        { id: "course", label: "Vissza a kurzushoz", icon: Home, href: `/dashboard/${courseId}` },
    ]

    const handleSubmissionAttachmentAdd = async () => {
        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            router.push("/login");
            return;
        }
        
        const endpoint = submission ? "edit" : "create";
        const attachmentz = Array.from(submissionAttachmentAdditions.entries()).map(([name, [url, _type]]) => ({path: url, name: name}));
        console.log(attachmentz);

        const response = await fetch(`/api/submissions/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: session?.user?.id,
                postId: +postId,
                submissionId: submission ? +submission.id : undefined,
                attachments: attachmentz
            })
        });

        switch(response.status) {
            case 201:
            case 200:
                const data = await response.json();
                setSubmission(data.submission);
                notify("Sikeres hozzáadás!", { type: "success", description: "A munkád sikeresen hozzáadva." });
                setSubmissionAttachmentAdditions(new Map());
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
        
        console.log(submission.attachments);

        const newAttachments = submission.attachments.filter((att: any) => att.fileName !== name || att.path !== url);
        
        console.log(newAttachments);

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
                console.log(data);
                setSubmission(data.submission);
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

        const tmpCourse = session.user.courses.find(c => c.id === +courseId);
        if (!tmpCourse) {
            notify("Nincs hozzáférésed ehhez a kurzushoz.", { type: "error" });
            router.push("/dashboard");
            return;
        }

        const tmpPost = tmpCourse.posts.find(p => p.id === +postId);
        if (!tmpPost) {
            notify("A bejegyzés nem található.", { type: "error" });
            router.push(`/dashboard/${courseId}`);
            return;
        }

        const teachers = tmpCourse.members.filter(cu => cu.isTeacher);

        setCourse(tmpCourse);
        setPost(tmpPost);
        setPostType(tmpPost.postType.name);
        setSubmission(tmpPost.submissions.find((s: Submission) => s.student.id === session.user?.id) || null);

        console.log(session);
    }, [session, status, router, courseId, postId]);

    useEffect(() => {
        if(!submission) return;


        submission.attachments = submission.attachments.map((attachment: any) => {
            console.log(attachment);
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
                    <PostDetailsCard course={course} post={post}></PostDetailsCard>
                    {!["ANNOUNCEMENT", "RESOURCE"].includes(postType || "") && (
                    <div className="flex flex-col gap-3">
                        <Card className="p-2">
                            <div className="p-4 flex flex-col gap-2 justify-end">
                                <h3 className="flex justify-end font-semibold mb-2">Feladat beadása</h3>
                                {!submission && (
                                    <p className="text-sm text-center text-muted-foreground mb-2">Még nem adtál le munkát erre a feladatra.</p>
                                )}
                                {submission && (
                                    <div className="flex flex-col gap-2">
                                        {submission.attachments.map((attachment: any, index: number) => (
                                            <SubmissionAttachmentCard 
                                                key={`SUBMISSION_ATTACHMENT_${index}`}
                                                name={attachment.fileName}
                                                url={attachment.path}
                                                onRemove={(name: string, url: string) => handleSubmissionAttachmentRemove(name, url)}
                                            />
                                        ))}
                                    </div>
                                )}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
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
                                
                                <Button
                                    className="w-full "
                                >
                                    Beadás
                                </Button>
                            </div>
                        </Card>
                    </div>
                    )}
                </div>
            </div>
        </div>
        )
    );
}
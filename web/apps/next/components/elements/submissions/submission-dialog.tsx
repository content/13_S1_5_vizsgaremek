import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Submission, Post, Attachment, HistorySubmission } from "@studify/types";
import React from "react";

import submissionStatusMappings from "@/lib/dashboard/submissionStatusMappings";
import AttachmentCard from "../attachments/attachment-card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import HistorySubmissionDialog from "./history-submission-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import GradeDialog from "./grade-dialog";
import { useSession } from "next-auth/react";
import { useNotificationProvider } from "@/components/notification-provider";
import { useRouter } from "next/navigation";

type SubmissionDialogProps = {
    submission: Submission;
    post: Post;
    children?: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    onGrade?: () => void;
}

export default function SubmissionDialog({ submission, post, isOpen, children, onClose, onGrade }: SubmissionDialogProps) {
    const { notify } = useNotificationProvider();
    const { data: session } = useSession();
    
    const router = useRouter();

    const [isOpenState, setIsOpenState] = React.useState(isOpen);
    const [openHistoryDialogId, setOpenHistoryDialogId] = React.useState<string | null>(null);
    const [isGradeDialogOpen, setIsGradeDialogOpen] = React.useState(false);
    
    const student = submission.student;

    const handleAcceptSubmission = async () => {
        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            router.push("/login");
            return;
        }
        
        const response = await fetch(`/api/submissions/grade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                submissionId: submission.id,
                score: null,
                postId: post.id,
                userId: session.user.id,
            }),
        });

        switch(response.status) {
            case 200:
                notify("Sikeres elfogadás!", { type: "success" });
                onGrade && onGrade();
                break;
            case 403:
                notify("Nincs jogosultságod a művelet végrehajtásához!", { type: "error" });
                break;
            case 404:
                notify("A beadás vagy a feladat nem található!", { type: "error" });
                break;
            case 500:
                notify("Hiba történt a beadás elfogadása során!", { type: "error" });
                break;
            default:
                notify("Ismeretlen hiba történt!", { type: "error" });
                break;
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpenState(open);
            if(!open) onClose();
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex flex-col gap-1">
                        {student.first_name} {student.last_name} feladata
                        <p className="text-sm text-muted-foreground">{submissionStatusMappings[submission.status.name as keyof typeof submissionStatusMappings]?.name}</p>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-5">
                    {submission.history.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-md font-semibold">
                                    Beadott anyag előzményei
                                </h2>
                                <p className="text-sm text-muted-foreground">A feladat megoldásának előzményeit a listából való kiválasztás után tekintheted meg.</p>
                            </div>
                            <Collapsible>
                                <CollapsibleTrigger asChild className="w-full">
                                    <Button variant="outline" className="w-full">Előzmények megtekintése</Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-5 flex flex-col gap-2">
                                    {submission.history.map((historyItem: HistorySubmission) => (
                                        <HistorySubmissionDialog 
                                            key={historyItem.id} 
                                            isOpen={openHistoryDialogId === historyItem.id} 
                                            submission={submission} 
                                            historySubmission={historyItem} 
                                            onClose={() => setOpenHistoryDialogId(null)}
                                        >
                                            <Button 
                                                variant={"outline"}
                                                onClick={() => setOpenHistoryDialogId(historyItem.id)}
                                            >
                                                {historyItem.versionNumber}. verzió
                                            </Button>
                                        </HistorySubmissionDialog>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    )}
                    {submission.attachments.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-md font-semibold">
                                    Csatolmányok
                                </h2>
                                <p className="text-sm text-muted-foreground">A beadott anyaghoz csatolt fájlok listája</p>
                            </div>
                            <div className="flex gap-2">
                                {submission.attachments.map((attachment: Attachment) => (
                                    <AttachmentCard key={attachment.id} attachment={attachment} size="small"/>
                                ))}
                            </div>
                        </div>
                    )}
                    {post.maxScore !== null && (
                    <GradeDialog submission={submission} post={post} isOpen={isGradeDialogOpen} onClose={() => setIsGradeDialogOpen(false)} onGrade={onGrade}>
                            <Button
                                variant="default"
                                className="mt-4 w-full"
                                onClick={() => setIsGradeDialogOpen(true)}
                            >
                                Osztályozás
                            </Button>
                    </GradeDialog>
                    )}
                    {post.maxScore === null && (
                        <Button
                            variant={"default"}
                            className="mt-4 w-full"
                            onClick={() => handleAcceptSubmission()}
                        >
                            Elfogadás
                        </Button>
                    )}
                </div> 
            </DialogContent>
        </Dialog>
    )
}

import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Submission, Post, Attachment } from "@studify/types";
import React from "react";

import submissionStatusMappings from "@/lib/dashboard/submissionStatusMappings";
import AttachmentCard from "../attachments/attachment-card";
import { Button } from "@/components/ui/button";

type SubmissionDialogProps = {
    submission: Submission;
    children?: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export default function SubmissionDialog({ submission, isOpen, children, onClose }: SubmissionDialogProps) {
    const [isOpenState, setIsOpenState] = React.useState(isOpen);
    
    const student = submission.student;

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
                <div className="flex flex-col gap-2">
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
                   <Button
                        variant="default"
                        className="mt-4 w-full"
                    >
                        Pontozás
                   </Button>
                </div> 
            </DialogContent>
        </Dialog>
    )
}
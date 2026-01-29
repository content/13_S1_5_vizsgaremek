import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Submission, HistorySubmission, Attachment } from "@studify/types";
import AttachmentCard from "../attachments/attachment-card";

type HistorySubmissionDialogProps = {
    submission: Submission;
    historySubmission: HistorySubmission;
    isOpen: boolean;
    children?: React.ReactNode;
    onClose: () => void;
}

export default function HistorySubmissionDialog({ submission, children, historySubmission, isOpen, onClose }: HistorySubmissionDialogProps) {
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
                        {student.first_name} {student.last_name} korábbi beadott feladata
                        <p className="text-sm text-muted-foreground">{historySubmission.versionNumber}. verzió</p>
                    </DialogTitle>
                </DialogHeader>
                {historySubmission.attachments.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-md font-semibold">
                                Csatolmányok
                            </h2>
                            <p className="text-sm text-muted-foreground">A beadott anyaghoz csatolt fájlok listája</p>
                        </div>
                        <div className="flex gap-2">
                            {historySubmission.attachments.map((attachment: Attachment) => (
                                <AttachmentCard key={attachment.id} attachment={attachment} size="small"/>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-muted-foreground">Nincsenek csatolmányok ehhez a verzióhoz.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
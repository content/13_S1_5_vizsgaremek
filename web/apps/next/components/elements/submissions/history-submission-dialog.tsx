import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Submission, HistorySubmission } from "@studify/types";

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
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    <p className="whitespace-pre-wrap">{historySubmission.comment || "Nincs megjegyzés a beadott feladathoz."}</p>
                </div> 
            </DialogContent>
        </Dialog>
    );
}
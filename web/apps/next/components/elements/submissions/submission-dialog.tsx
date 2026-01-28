import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Submission, Post } from "@studify/types";
import React from "react";

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
                    <DialogTitle className="flex flex-col">
                        {student.first_name} {student.last_name} feladata
                    </DialogTitle>
                </DialogHeader>
                <div>
                    
                </div>
            </DialogContent>
        </Dialog>
    )
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Submission } from "@studify/types";
import { UserAvatar } from "../avatar";
import Link from "next/link";
import SubmissionDialog from "./submission-dialog";
import React from "react";


type SubmissionCardProps = {
    submission: Submission;
    href: string;
    className?: string;
}

export default function SubmissionCard({ submission, href, className }: SubmissionCardProps) {
    const student = submission.student;
    
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    return (
        <SubmissionDialog submission={submission} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <Card 
                className={`hover:shadow-lg transition-shadow hover:bg-primary/10 flex flex-row space-between items-center cursor-pointer ${className}`} 
                onClick={() => setIsDialogOpen(true)}                
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                        <UserAvatar user={student} size="large"/>
                        <span className="flex flex-col">
                            {student.first_name} {student.last_name}
                            <span className="text-sm text-muted-foreground">({student.email})</span>
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="w-full flex justify-end items-center p-0 pe-12">
                    {submission.score !== null && (
                        <div className="bg-primary/10 rounded-lg p-5">
                            <span className="font-medium text-primary">{submission.score}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </SubmissionDialog>
    )
}
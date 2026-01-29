import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Submission, Post } from "@studify/types";
import React from "react";
import { UserAvatar } from "../avatar";
import SubmissionDialog from "./submission-dialog";


type SubmissionCardProps = {
    submission: Submission;
    post: Post;
    href: string;
    className?: string;
}

export default function SubmissionCard({ submission, post, href, className }: SubmissionCardProps) {
    const student = submission.student;
    
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    return (
        <SubmissionDialog submission={submission} post={post} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onGrade={() => setIsDialogOpen(false)}>
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
                <CardContent className="w-full flex justify-end items-center p-0 pe-12 gap-2">
                    {submission.status.name === "GRADED" && (
                        <div className="bg-green-400/30 rounded-lg p-5">
                            <span className="font-medium text-primary"> Értékelt </span>
                        </div>
                    )}
                    {submission.score !== null && (
                        <div className="bg-primary/10 rounded-lg p-5">
                            <span className="font-medium text-primary">{submission.score} <span className="text-muted-foreground">/</span> {post.maxScore}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </SubmissionDialog>
    )
}
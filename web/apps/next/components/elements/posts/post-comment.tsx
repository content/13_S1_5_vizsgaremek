import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Comment, Course, CourseMember, Post, User } from "@studify/types";
import { UserAvatar } from "../avatar";
import { useEffect, useState } from "react";
import { getRelativeTime } from "@/lib/time/utils";

type PostCommentProps = {
    comment: Comment;
    course: Course;
}

export default function PostComment({ comment, course }: PostCommentProps) {
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        if(!course || !comment) return;

        const member = course.members?.find((m: CourseMember) => m.user?.id === comment.sender.id);
        setIsTeacher(member?.isTeacher || false);
    }, [course])

    return (
        <Card>
            <CardHeader className="flex flex-row gap-2 items-center pb-3">
                <UserAvatar user={comment.sender} size="large"/>
                <CardTitle className="flex flex-col">
                    <h3 className="text-lg font-bold m-0">{comment.sender.first_name} {comment.sender.last_name}</h3>
                    <p className="text-sm text-muted-foreground font-normal m-0">
                        {isTeacher ? 'Tanár' : 'Tanuló'} • {getRelativeTime(comment.createdAt)}
                    </p>
                </CardTitle>
            </CardHeader>
            <CardContent className="text-wrap break-words">
                {comment.message}
            </CardContent>
        </Card>
    )
}
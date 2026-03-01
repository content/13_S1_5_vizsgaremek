import { editSubmission, getPostById, getSubmissionById, isUserCourseMember } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { Attachment, Course, Post } from "@studify/types";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(req: NextRequest) {
    
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { postId, submissionId, attachments } = await req.json();
    
    const user = session.user as any;
    const userId = user.id;

    const post = await getPostById(postId);
    if(!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const submission = await getSubmissionById(submissionId);
    if(!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const course = user.courses.find((c: Course) => c.posts.some((p: Post) => p.id === postId));
    if(!course) {
        return NextResponse.json({ error: 'Course not found for user' }, { status: 404 });
    }

    const isMember = await isUserCourseMember(course.id, userId);
    if(!isMember) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const existingAttachments = attachments.filter((att: Attachment) => att.id !== undefined);
    const newAttachments = attachments.filter((att: Attachment) => att.id === undefined);
    const keepExistingAttachmentIds = existingAttachments.map((att: Attachment) => att.id);

    const editedSubmission = await editSubmission(
        submissionId,
        userId,
        newAttachments.map((att: Attachment) => ({ path: att.path, name: att.fileName })),
        keepExistingAttachmentIds
    );

    await fireWebsocketEvent("submission-edited", { submission: editedSubmission, postId, courseId: course.id });

    return NextResponse.json(editedSubmission);
}
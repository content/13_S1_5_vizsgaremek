import { editSubmission, getPostById, getSubmissionById, isUserCourseMember } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { Attachment } from "@studify/types";

export async function POST(req: NextRequest) {
    const { userId, postId, submissionId, attachments } = await req.json();

    const post = await getPostById(postId);
    if(!post) {
        return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }

    const submission = await getSubmissionById(submissionId);
    if(!submission) {
        return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404 });
    }

    const isMember = await isUserCourseMember(post.courseId, userId);
    if(!isMember) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const existingAttachments = attachments.filter((att: Attachment) => att.id !== undefined);
    const newAttachments = attachments.filter((att: Attachment) => att.id === undefined);
    const keepExistingAttachmentIds = existingAttachments.map((att: Attachment) => att.id);

    const editedSubmission = await editSubmission(
        submissionId,
        userId,
        newAttachments.map((att: Attachment) => ({ path: att.path, name: att.name })),
        keepExistingAttachmentIds
    );

    return NextResponse.json(editedSubmission);
}
import { getPostById, isUserCourseMember } from "@studify/database";
import { createSubmission } from "@studify/database/queries/submissions/submissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { userId, postId, attachments } = await req.json();

    const post = await getPostById(postId);

    if(!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isMember = await isUserCourseMember(post.courseId, userId);
    if(!isMember) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const submission = await createSubmission(postId, userId, attachments);

    if(!submission) {
        return NextResponse.json({ error: 'Could not create submission' }, { status: 500 });
    }

    return NextResponse.json({ submission: submission }, { status: 201 });
}
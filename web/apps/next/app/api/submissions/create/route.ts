import { authConfig } from "@/app/auth";
import { getPostById, isUserCourseMember } from "@studify/database";
import { createSubmission } from "@studify/database/queries/submissions/submissions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";
import { Course, Post } from "@studify/types";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authConfig);
        
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { postId, attachments } = await req.json();

    const user = session.user as any;
    const userId = user.id;

    const post = await getPostById(postId);

    if(!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const course = session.user.courses.find((c: Course) => c.posts.some((p: Post) => p.id === postId));
    if(!course) {
        return NextResponse.json({ error: 'Post not found in user courses' }, { status: 404 });
    }

    const isMember = await isUserCourseMember(course.id, userId);
    if(!isMember) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const submission = await createSubmission(postId, userId, attachments);

    if(!submission) {
        return NextResponse.json({ error: 'Could not create submission' }, { status: 500 });
    }

    await fireWebsocketEvent("submission-created", { submission, postId, courseId: post.courseId });

    return NextResponse.json({ submission: submission }, { status: 201 });
}
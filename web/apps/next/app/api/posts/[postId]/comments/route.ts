import { authConfig } from "@/app/auth";
import { createNewComment, getCommentById, getPostById } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
    const session = await getServerSession(authConfig);

    if(!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { postId } = params;
    
    const course = session.user.courses.find(c => c.posts.some(p => p.id === +postId));

    if(!course) {
        return NextResponse.json({ error: 'Post not found in user courses' }, { status: 404 });
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const success = await createNewComment(+postId, session.user.id, content.trim());
    if(typeof success !== 'number') {
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    const comment = await getCommentById(success);

    if (!comment) {
        return NextResponse.json({ error: 'Failed to retrieve created comment' }, { status: 500 });
    }

    const post = await getPostById(+postId);
    if (post) {
        await fireWebsocketEvent("comment-created", { comment, post, courseId: course.id });
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
}
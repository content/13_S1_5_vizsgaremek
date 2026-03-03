import { authConfig } from "@/app/auth";
import { sendMessageToPostConversation } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
    const session = await getServerSession(authConfig);

    if(!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = +(await params).postId;

    if(isNaN(postId)) {
        return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const course = session.user.courses.find(c => c.posts.some(p => p.id === postId));
    if(!course) {
        return NextResponse.json({ error: 'Post not found in user courses' }, { status: 404 });
    }

    const post = course.posts.find(p => p.id === postId);
    if(!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { content, recipientId } = await request.json();
    if(!content || typeof content !== 'string') {
        return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }
    
    const isTeacher = course.members.find(m => m.user.id === session.user?.id)?.isTeacher || false;
    const message = await sendMessageToPostConversation(postId, session.user.id, content, isTeacher ? recipientId : undefined);
    
    if(!message) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    const actualRecipientId = isTeacher ? recipientId : undefined;
    if (actualRecipientId) {
        await fireWebsocketEvent("private-message", { message, senderId: session.user.id, recipientId: actualRecipientId });
    }

    return NextResponse.json({ success: true, message });
}
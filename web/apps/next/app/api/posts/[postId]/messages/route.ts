import { authConfig } from "@/app/auth";
import { getConversationByPostIdAndUserId } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

    const { userId } = await request.json();
    if(!userId || typeof userId !== 'number') {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const messages = await getConversationByPostIdAndUserId(postId, userId, session.user.id);

    if(!messages) {
        return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messages });
}
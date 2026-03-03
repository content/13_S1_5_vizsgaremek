import { authConfig } from "@/app/auth";
import { getConversationByPostIdAndUserId, getConversationsByPostIdAndTeacherId } from "@studify/database";
import { CourseMember } from "@studify/types";
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
    
    const isTeacher = course.members.find((m: CourseMember) => m.user.id === session.user?.id)?.isTeacher || false;
    
    if(isTeacher) {
        const conversations = await getConversationsByPostIdAndTeacherId(postId, session.user.id);
        if(!conversations) {
            return NextResponse.json({ error: 'Failed to retrieve conversations' }, { status: 500 });
        }
        
        return NextResponse.json({ success: true, conversations });
    }
    
    const { receiverId } = await request.json();
    if(!receiverId || typeof receiverId !== 'number') {
        return NextResponse.json({ error: 'Invalid receiver ID' }, { status: 400 });
    }
    
    const messages = await getConversationByPostIdAndUserId(postId, session.user.id, receiverId);

    if(!messages) {
        return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messages });
}
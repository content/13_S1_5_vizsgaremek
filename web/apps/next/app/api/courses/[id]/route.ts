import { authConfig } from '@/app/auth';
import { getCourseById, getPostsByCourseId, isUserCourseMember } from '@studify/database';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authConfig);
        
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
    
    const { id } = await params;

    if(isNaN(Number(id))) {
        return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const course = await getCourseById(+id);

    if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const user = session.user as any;
    const userId = user.id;

    if(await isUserCourseMember(+id, userId) === false) {
        return NextResponse.json({ error: 'User is not a member of this course' }, { status: 403 });
    }

    return NextResponse.json({
        id: id,
        name: course.id,
        invitationCode: course.invitationCode,
        backgroundImage: course.backgroundImage,
        members: course.members,
        posts: course.posts,
    });
}
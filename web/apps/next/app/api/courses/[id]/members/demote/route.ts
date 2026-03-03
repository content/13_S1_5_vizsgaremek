import { authConfig } from "@/app/auth";
import { demoteMember, getCourseById } from "@studify/database";
import { CourseMember } from "@studify/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authConfig);

    if(!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = +(await params).id;

    if(isNaN(courseId)) {
        return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const course = session.user.courses.find(c => c.id === courseId);

    if(!course) {
        return NextResponse.json({ error: 'Course not found in user courses' }, { status: 404 });
    }

    const isTeacher = course.members.find((m: CourseMember) => m.user.id === session.user?.id)?.isTeacher;

    if(!isTeacher) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();
    if(!userId || typeof userId !== 'number') {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const isEnrolled = course.members.some((m: CourseMember) => m.user.id === userId);

    if(!isEnrolled) {
        return NextResponse.json({ error: 'User is not a member of the course' }, { status: 404 });
    }

    const success = await demoteMember(courseId, userId);

    if(!success) {
        return NextResponse.json({ error: 'Failed to promote member' }, { status: 500 });
    }

    // Fire websocket event for member demotion
    const updatedCourse = await getCourseById(courseId);
    if (updatedCourse) {
        const demotedMember = updatedCourse.members.find(m => m.user.id === userId);
        if (demotedMember) {
            await fireWebsocketEvent("course-member-demoted", { course: updatedCourse, member: demotedMember });
        }
    }

    return NextResponse.json({ success: true });
}
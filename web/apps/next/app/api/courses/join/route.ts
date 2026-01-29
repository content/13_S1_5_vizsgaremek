import { getCourseByInvitationCode, joinCourse } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { CourseMember } from "@studify/types";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { userId, invitationCode } = body;

    const course = await getCourseByInvitationCode(invitationCode);
    if (!course) {
        return NextResponse.json({ error: "Invalid invitation code" }, { status: 400 });
    }

    const isMember = course.members.some((member: CourseMember) => member.user.id === userId);
    if (isMember) {
        return NextResponse.json({ error: "User is already a member of the course or has already applied" }, { status: 400 });
    }

    const joinedCourse = await joinCourse(userId, invitationCode);

    return NextResponse.json(joinedCourse);
}
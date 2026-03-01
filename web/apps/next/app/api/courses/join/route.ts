import { getCourseByInvitationCode, getCourseMembers, joinCourse } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { CourseMember } from "@studify/types";
import { authConfig } from "@/app/auth";
import { getServerSession } from "next-auth";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authConfig);
        
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();

    const { invitationCode } = body;

    const user = session.user as any;
    const userId = user.id;

    const course = await getCourseByInvitationCode(invitationCode);
    if (!course) {
        return NextResponse.json({ error: "Invalid invitation code" }, { status: 400 });
    }

    const isMember = course.members.some((member: CourseMember) => member.user.id === userId);
    if (isMember) {
        return NextResponse.json({ error: "User is already a member of the course or has already applied" }, { status: 400 });
    }

    const joinedCourse = await joinCourse(userId, invitationCode);

    const member = await getCourseMembers(course.id).then(members => members.find((m: CourseMember) => m.user.id === userId));

    await fireWebsocketEvent("course-member-join", { course: course, member: member });

    return NextResponse.json(joinedCourse);
}
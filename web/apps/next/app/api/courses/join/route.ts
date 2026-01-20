import { getCourseByInvitationCode, joinCourse } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { userId, invitationCode } = body;

    const course = await getCourseByInvitationCode(invitationCode);
    if (!course) {
        return NextResponse.json({ error: "Invalid invitation code" }, { status: 400 });
    }

    const joinedCourse = await joinCourse(userId, invitationCode);

    return NextResponse.json(joinedCourse);
}
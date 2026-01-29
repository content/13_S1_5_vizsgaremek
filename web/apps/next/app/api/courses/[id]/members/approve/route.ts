import { approveUser, isUserTeacher } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const courseId = (await params).id;
    const { initiatorId, targetId } = await req.json();

    const isInitiatorTeacher = await isUserTeacher(+courseId, initiatorId);

    if(!isInitiatorTeacher) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = approveUser(+courseId, targetId);

    if(!result) {
        return new NextResponse("Failed to approve user", { status: 500 });
    }

    return NextResponse.json({ message: "User approved successfully" });
}
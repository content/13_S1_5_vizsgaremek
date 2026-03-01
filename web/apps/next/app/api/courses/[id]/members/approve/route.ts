import { authConfig } from "@/app/auth";
import { approveUser, isUserTeacher } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authConfig);
        
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const courseId = (await params).id;
    const { targetId } = await req.json();

    const initiator = session.user as any;
    const isInitiatorTeacher = await isUserTeacher(+courseId, initiator.id);

    if(!isInitiatorTeacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await approveUser(+courseId, targetId);

    if(!result) {
        return NextResponse.json({ error: "Failed to approve user" }, { status: 500 });
    }

    await fireWebsocketEvent("course-member-approved", { courseId: +courseId, userId: targetId });

    return NextResponse.json({ message: "User approved successfully" });
}
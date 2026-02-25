import { authConfig } from "@/app/auth";
import { declineUser, isUserTeacher } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

    const result = await declineUser(+courseId, targetId);

    if(!result) {
        return NextResponse.json({ error: "Failed to decline user" }, { status: 500 });
    }

    return NextResponse.json({ message: "User declined successfully" }, { status: 200 });
}

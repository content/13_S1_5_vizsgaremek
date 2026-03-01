import { authConfig } from "@/app/auth";
import { leaveCourse } from "@studify/database";
import { Course } from "@studify/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authConfig);

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const courseId = (await params).id;
    const userId = session.user.id;

    const hasCourse = session.user.courses.some((course: Course) => course.id === +courseId);

    if (!hasCourse) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await leaveCourse(userId, +courseId);

    if (success) {
        await fireWebsocketEvent("course-member-leave", { courseId: +courseId, userId });
        return NextResponse.json({ message: "Successfully left the course" });
    }

    return NextResponse.json({ error: "Failed to leave the course" }, { status: 500 });
}
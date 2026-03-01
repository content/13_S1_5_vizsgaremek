import { authConfig } from "@/app/auth";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";
import { deleteCourse } from "@studify/database";
import { User } from "@studify/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authConfig);

    if(!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as unknown as User;
    const courseId = await req.json();

    const course = user.courses.find(c => c.id === +courseId);
    if(!course) {
        return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const isTeacher = course.members.some(m => m.user.id === user.id && m.isTeacher);
    if(!isTeacher) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const success = await deleteCourse(course.id);
    if(!success) {
        return NextResponse.json({ error: "Failed to delete course." }, { status: 500 });
    }

    await fireWebsocketEvent("course-deleted", { courseId: course.id }, `course:${course.id}`);

    return NextResponse.json({ success: true });
}
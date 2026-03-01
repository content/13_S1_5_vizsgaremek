import { authConfig } from "@/app/auth";
import { createNewPost, getCourseById, getPostTypes } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authConfig);
        
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { courseId, postTypeId, name, description, deadlineAt, pollPostOptions, attachments, maxScore } = await req.json();

    const user = session.user as any;
    const userId = user.id;

    const postTypes = await getPostTypes();
    if(!postTypes.find(pt => pt.id === postTypeId)) {
        return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    const course = await getCourseById(courseId);
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // TODO: Check if user is a teacher in the course or has permissions to create a post

    const post = await createNewPost({
        userId: userId,
        courseId,
        postTypeId,
        name,
        description,
        deadlineAt: deadlineAt ? deadlineAt : undefined,
        pollPostOptions,
        attachments: attachments,
        maxScore: maxScore,
    });

    await fireWebsocketEvent("new-post", { post, courseId });

    return NextResponse.json({ post }, { status: 201 });
}
import { createNewPost, getCourseById, getPostTypes } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { userId, courseId, postTypeId, name, description, deadlineAt, pollPostOptions, attachments } = await req.json();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log(postTypeId);

    const postTypes = await getPostTypes();
    if(!postTypes.find(pt => pt.id === postTypeId)) {
        return NextResponse.json({ error: "Invalid post type" }, { status: 400 });
    }

    const course = await getCourseById(courseId);
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const post = await createNewPost({
        userId: userId,
        courseId,
        postTypeId,
        name,
        description,
        deadlineAt: deadlineAt ? new Date(deadlineAt) : undefined,
        pollPostOptions,
        attachments: attachments,
    });

    return NextResponse.json({ post }, { status: 201 });
}
import { authConfig } from "@/app/auth";
import { createNewPost, getCourseById, getPostTypes } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";
import { PostType } from "@studify/types";

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

    const isEnrolled = course.members.some(m => m.user.id === userId);
    if(!isEnrolled) {
        return NextResponse.json({ error: "User not enrolled in course" }, { status: 403 });
    }

    const isTeacher = course.members.find(m => m.user.id === userId)?.isTeacher;
    const allowedPostTypes = course.settings.allowedStudentPostTypes;
    
    const canCreatePosts = isTeacher || (course.settings.studentsCanCreatePosts && !isTeacher && allowedPostTypes.some((pt: PostType) => pt.id == postTypeId));

    if(!canCreatePosts) {
        return NextResponse.json({ error: "User does not have permission to create posts" }, { status: 403 });
    }

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
import { getPostById, getSubmissionById, gradeSubmission, updateSubmissionStatus } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { Course, Post, Submission } from "@studify/types";
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

    const { postId, submissionId, score } = await req.json();

    const user = session.user as any;
    const userId = user.id;

    const post = await getPostById(+postId);
    if(!post) {
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if(post.author.id !== +userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const course = user.courses.find((c: Course) => c.posts.some((p: Post) => p.id === +postId));
    if(!course) {
        return NextResponse.json({ message: "Course not found for user" }, { status: 404 });
    }

    const maxScore = post.maxScore;
    const submission = await getSubmissionById(+submissionId);
    if(!submission) {
        return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    if(score !== null) {
        const parsedScore = Math.min(Math.max(+score, 0), maxScore || 0);

        const isGradeUpdateSuccessful = await gradeSubmission(+submissionId, parsedScore);
        if(!isGradeUpdateSuccessful) {
            return NextResponse.json({ message: "Failed to grade submission" }, { status: 500 });
        }
    }
    const isStatusUpdateSuccessful = await updateSubmissionStatus(+submissionId, 3);

    if(!isStatusUpdateSuccessful) {
        return NextResponse.json({ message: "Failed to grade submission" }, { status: 500 });
    }

    const updatedSubmission = await getSubmissionById(+submissionId);

    await fireWebsocketEvent("submission-graded", { submission: updatedSubmission, postId: +postId, courseId: course.id });

    return NextResponse.json({ submission: updatedSubmission }, { status: 200 });
}
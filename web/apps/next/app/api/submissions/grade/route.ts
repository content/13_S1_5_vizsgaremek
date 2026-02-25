import { getPostById, getSubmissionById, gradeSubmission, updateSubmissionStatus } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { Submission } from "@studify/types";
import { authConfig } from "@/app/auth";
import { getServerSession } from "next-auth";

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

    const maxScore = post.maxScore;
    const submission = await getSubmissionById(+submissionId);
    if(!submission) {
        return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    if(score !== null) {
        const parsedScore = Math.min(Math.max(+score, 0), maxScore);

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

    return NextResponse.json({ submission: updatedSubmission }, { status: 200 });
}
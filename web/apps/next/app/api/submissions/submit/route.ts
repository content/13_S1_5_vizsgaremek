import { getSubmissionById, getUserById, updateSubmissionStatus, updateSubmissionSubmittedAt } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { Course, Post, CourseMember } from "@studify/types";
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
    

    const { submissionId, postId } = await req.json();

    const user = session.user as any;
    const userId = user.id;

    const course = user.courses.find((c: Course) => c.posts.some((post: Post) => post.id === +postId));
    if(!course) {
        return NextResponse.json({ message: "Course not found for user" }, { status: 404 });
    }

    const post = course.posts.find((post: Post) => post.id === +postId);
    if(!post) {
        return NextResponse.json({ message: "Post not found in course" }, { status: 404 });
    }

    const isStudent = course.members.some((m: CourseMember) => m.user.id === +userId && !m.isTeacher && m.isApproved);
    if(!isStudent) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const submission = post.submissions.find((submission: any) => submission.id === +submissionId);
    if(!submission) {
        return NextResponse.json({ message: "Submission not found in post" }, { status: 404 });
    }

    const hasSubmitted = submission.status.id === 2;
    if(hasSubmitted) {
        return NextResponse.json({ message: "Already submitted" }, { status: 400 });
    }

    const isGraded = submission.status.id === 3;
    if(isGraded) {
        return NextResponse.json({ message: "Cannot submit a graded submission" }, { status: 400 });
    }

    const isStatusUpdateSuccessful = await updateSubmissionStatus(+submissionId, 2);
    const isSubmittedDateUpdateSuccessful = await updateSubmissionSubmittedAt(+submissionId, new Date());
    if(!isStatusUpdateSuccessful || !isSubmittedDateUpdateSuccessful) {
        return NextResponse.json({ message: "Failed to submit submission" }, { status: 500 });
    }

    const updatedSubmission = await getSubmissionById(+submissionId);

    await fireWebsocketEvent("submission-submitted", { submission: updatedSubmission, postId: +postId, courseId: course.id });

    return NextResponse.json(updatedSubmission, { status: 200 });
}
import { getSubmissionById, getUserById, updateSubmissionStatus, updateSubmissionSubmittedAt } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";
import { Course, Post, CourseMember } from "@studify/types";

export async function POST(req: NextRequest) {
    const { userId, submissionId, postId } = await req.json();

    const user = await getUserById(userId);
    if(!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

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

    const isSubmitted = submission.status.id === 2;
    if(!isSubmitted) {
        return NextResponse.json({ message: "Submission is not submitted" }, { status: 400 });
    }

    const isGraded = submission.status.id === 3;
    if(isGraded) {
        return NextResponse.json({ message: "Cannot unsubmit a graded submission" }, { status: 400 });
    }

    const isStatusUpdateSuccessful = await updateSubmissionStatus(+submissionId, 1);
    const isSubmittedDateUpdateSuccessful = await updateSubmissionSubmittedAt(+submissionId, null);
    if(!isStatusUpdateSuccessful || !isSubmittedDateUpdateSuccessful) {
        return NextResponse.json({ message: "Failed to unsubmit submission" }, { status: 500 });
    }

    const updatedSubmission = await getSubmissionById(+submissionId);

    return NextResponse.json(updatedSubmission, { status: 200 });
}
import React from "react";

export default function PostPage({ params }: { params: { courseId: string, postId: string } }) {
    const { courseId, postId } = params;

    return <div>Post Page ({courseId} - {postId})</div>;
}
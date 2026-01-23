import { and, eq } from 'drizzle-orm';

import { db } from '../../mysql';
import { Post } from '@studify/types';
import { comments, posts, postTypes } from '../../schema/posts';
import { getAttachmentsByPostId } from '../attachments/attachments';

export async function getPostsByCourseId(courseId: number): Promise<Post[]> {
    const coursePosts = await db
        .select()
        .from(posts)
        .where(and(eq(posts.courseId, courseId)))
        .execute();

    const coursePostsArr = coursePosts.map(async (post: any) => {
        const commentz = await db
            .select()
            .from(comments)
            .where(and(eq(comments.postId, post.id)))
            .execute();

        const attachments = await getAttachmentsByPostId(post.id);

        return {
            id: post.id,
            postType: post.postType,
            name: post.name,
            description: post.description,
            deadlineAt: post.deadlineAt,
            isEdited: post.isEdited,
            createdAt: post.createdAt,
            comments: commentz,
            attachments: attachments
        };
    }) as unknown as Post[];

    coursePostsArr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return coursePostsArr;
}

export async function getPostById(postId: number): Promise<Post | null> {
    const postResult = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .execute();

    const post = postResult[0];

    if (!post) {
        return null;
    }

    return {
        id: post.id,
        courseId: post.courseId,
        description: post.description,
        createdAt: post.createdAt,
    } as unknown as Post;
}

export async function getPostTypes(): Promise<string[]> {
    const postTypez = await db
        .select()
        .from(postTypes)
        .execute();

    return postTypez.map((type) => type.name.toUpperCase());
}
import { and, eq } from 'drizzle-orm';

import { db } from '../../mysql';
import { Post } from '@studify/types';
import { posts } from '../../schema/posts';

export async function getPostsByCourseId(courseId: number): Promise<Post[]> {
    const coursePosts = await db
        .select()
        .from(posts)
        .where(and(eq(posts.courseId, courseId)))
        .execute();

    return coursePosts.map((post: any) => ({
        id: post.id,
        courseId: post.courseId,
        authorId: post.authorId,
        content: post.content,
        createdAt: post.createdAt,
    })) as unknown as Post[];
}
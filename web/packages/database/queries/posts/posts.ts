import { and, eq } from 'drizzle-orm';

import { Attachment, PollPostOption, Post } from '@studify/types';
import { db } from '../../mysql';
import { comments, pollPostsOptions, postAttachments, posts, postTypes } from '../../schema/posts';
import { createAttachment, createRelation, getAttachmentsByPostId } from '../attachments/attachments';
import { getAllSubmissionsByPostId } from '../submissions/submissions';
import { getCourseMembers } from '../courses/courses';

export async function getPostsByCourseId(courseId: number): Promise<Post[]> {
    const coursePosts = await db
        .select()
        .from(posts)
        .where(and(eq(posts.courseId, courseId)))
        .execute();

    const coursePostsArr = await Promise.all(coursePosts.map(async (post: any) => {
        const commentz = await db
            .select()
            .from(comments)
            .where(and(eq(comments.postId, post.id)))
            .execute();

        const attachments = await getAttachmentsByPostId(post.id);
        const postType = await getPostType(post.postTypeId);

        const submissions = await getAllSubmissionsByPostId(post.id);

        return {
            id: post.id,
            postType: postType,
            name: post.name,
            description: post.description,
            deadlineAt: post.deadlineAt,
            isEdited: post.isEdited,
            createdAt: post.createdAt,
            comments: commentz,
            attachments: attachments,
            submissions: submissions,
        };
    })) as unknown as Post[];

    coursePostsArr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return coursePostsArr;
}

export async function getPostsByCourseIdandUserId(courseId: number, userId: number): Promise<Post[]> {
    const members = await getCourseMembers(courseId);

    const isUserTeacher = members.find(member => member.user?.id === userId)?.isTeacher || false;
    const allPosts = await getPostsByCourseId(courseId);
    
    if (isUserTeacher) {
        return allPosts;
    }
    
    const filteredPosts: Post[] = [];

    for (const post of allPosts) {
        const submissions = post.submissions || [];
        const userSubmission = submissions.filter(submission => submission.student.id === userId);

        post.submissions = userSubmission;

        filteredPosts.push(post);
    }

    return filteredPosts;
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
        deadlineAt: post.deadlineAt,
        isEdited: post.isEdited,
        name: post.name,
        postType: await getPostType(post.postTypeId)
    } as unknown as Post;
}

export async function getPostType(typeId: number): Promise<{id: number, name: string} | null> {
    const postTypeResult =  await db
        .select()
        .from(postTypes)
        .where(eq(postTypes.id, typeId))
        .execute();

    const postType = postTypeResult[0];

    if(!postType) {
        return null;
    }

    return {id: postType.id, name: postType.name.toUpperCase()};
}

export async function getPostTypes(): Promise<{id: number, name: string}[]> {
    const postTypez = await db
        .select()
        .from(postTypes)
        .execute();

    return postTypez.map((type) => ({id: type.id, name: type.name.toUpperCase()}));
}

type CreateNewPostParams = {
    userId: number;
    courseId: number;
    postTypeId: number;
    name: string;
    description: string;
    attachments: {path: string, name: string}[];
    deadlineAt?: Date;
    pollPostOptions?: string[];
};

export async function createNewPost({ userId, courseId, postTypeId, name, description, deadlineAt, pollPostOptions, attachments }: CreateNewPostParams): Promise<Post> {    
    const results = await db
        .insert(posts)
        .values({
            courseId: courseId,
            postTypeId: postTypeId,
            name: name,
            description: description,
            deadlineAt: deadlineAt || null,
        })
        .execute();
    
    const postId = results[0].insertId;

    if(!postId) {
        throw new Error('Failed to create new post');
    }

    const postTypes = await getPostTypes();
    const pollPostTypeId = postTypes.filter((type) => type.name === 'POLL')[0].id;
    const pollPostOptionz: PollPostOption[] = [];

    if(postTypeId === pollPostTypeId && pollPostOptions) {
        for(const optionText of pollPostOptions) {
            pollPostOptionz.push(await addPollOptionToPost(postId, optionText));
        }
    }

    const attachmentz: Attachment[] = [];

    for(const attachment of attachments) {
        const { path, name } = attachment;
        const attachmentRecord = await createAttachment(userId, path, name)
        const relation = await createRelation({ foreignId: postId, attachmentId: attachmentRecord.id, table: postAttachments });

        attachmentz.push(attachmentRecord);
    }

    return {
        id: postId,
        name: name,
        description: description,
        postType: postTypes.find((type) => type.id === postTypeId)!,
        pollPostOptions: pollPostOptionz,
        deadlineAt: deadlineAt || null,
        isEdited: false,
        createdAt: new Date(),
        comments: [],
        attachments: attachmentz,
    } as unknown as Post;
}

export async function addPollOptionToPost(postId: number, optionText: string): Promise<PollPostOption> {
    const result = await db
        .insert(pollPostsOptions)
        .values({
            postId: postId,
            optionText: optionText,
        })
        .execute();

    return {
        id: result.insertId!,
        optionText: optionText,
        voteCount: 0,
    } as PollPostOption;
}
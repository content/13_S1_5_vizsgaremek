import { and, eq, or } from 'drizzle-orm';

import { Attachment, Comment, Message, PollPostOption, Post, User } from '@studify/types';
import { db } from '../../mysql';
import { comments, pollPostsOptions, postAttachments, postMessages, posts, postTypes } from '../../schema/posts';
import { createAttachment, createRelation, getAttachmentsByPostId } from '../attachments/attachments';
import { getAllSubmissionsByPostId } from '../submissions/submissions';
import { getCourseMembers } from '../courses/courses';
import { getUserById, getUserByIdWithoutCourses } from '../users/users';

export async function getPostsByCourseId(courseId: number): Promise<Post[]> {
    const coursePosts = await db
        .select()
        .from(posts)
        .where(and(eq(posts.courseId, courseId)))
        .execute();

    const coursePostsArr = await Promise.all(coursePosts.map(async (post: any) => {
        const commentz = await getCommentsByPostId(post.id);

        const attachments = await getAttachmentsByPostId(post.id);
        const postType = await getPostType(post.postTypeId);

        const submissions = await getAllSubmissionsByPostId(post.id);
        const author = await getUserByIdWithoutCourses(post.authorId);

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
            maxScore: post.maxScore,
            author: author,
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

    const author = await getUserByIdWithoutCourses(post.authorId);

    const commentz = await getCommentsByPostId(post.id);

    return {
        id: post.id,
        courseId: post.courseId,
        description: post.description,
        createdAt: post.createdAt,
        deadlineAt: post.deadlineAt,
        isEdited: post.isEdited,
        name: post.name,
        postType: await getPostType(post.postTypeId),
        maxScore: post.maxScore,
        attachments: await getAttachmentsByPostId(post.id),
        author: author,
        comments: commentz
    } as unknown as Post;
}

export async function getPostByIdWithoutComments(postId: number): Promise<Post | null> {
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
        postType: await getPostType(post.postTypeId),
        maxScore: post.maxScore,
        attachments: await getAttachmentsByPostId(post.id),
        comments: [],
    } as unknown as Post;
}

export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
    const commentResults = await db
        .select()
        .from(comments)
        .where(eq(comments.postId, postId))
        .execute();

    const post = await getPostByIdWithoutComments(postId);

    return await Promise.all(commentResults.map(async (comment: any) => {
        const sender = await getUserByIdWithoutCourses(comment.senderId);

        return {
            id: comment.id,
            post: post!,
            sender: sender as User,
            message: comment.content,
            createdAt: comment.createdAt,
        } as Comment;
    }));
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

    return postTypez.map((type: any) => ({id: type.id, name: type.name.toUpperCase()}));
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
    maxScore: number | null;
};

export async function createNewPost({ userId, courseId, postTypeId, name, description, deadlineAt, pollPostOptions, attachments, maxScore }: CreateNewPostParams): Promise<Post> {    
    const results = await db
        .insert(posts)
        .values({
            courseId: courseId,
            postTypeId: postTypeId,
            name: name,
            description: description,
            deadlineAt: deadlineAt ? new Date(deadlineAt) : null,
            maxScore: maxScore || null,
            authorId: userId,
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

    const author = await getUserByIdWithoutCourses(userId);

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
        author: author,
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

export async function createNewComment(postId: number, senderId: number, message: string): Promise<number | null> {
    const result = await db
        .insert(comments)
        .values({
            postId: postId,
            senderId: senderId,
            content: message,
        })
        .execute();

    return result[0].insertId || null; 
}

export async function getCommentById(commentId: number): Promise<Comment | null> {
    const commentResult = await db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .execute();

    const comment = commentResult[0];

    if (!comment) {
        return null;
    }

    const post = await getPostById(comment.postId);

    if(!post) {
        return null;
    }

    return {
        id: comment.id,
        post: post!,
        sender: await getUserByIdWithoutCourses(comment.senderId) as User,
        message: comment.content,
        createdAt: comment.createdAt,
    } as Comment;
}

export async function getConversationsByPostIdAndTeacherId(postId: number, teacherId: number): Promise<{ student: User, messages: Message[] }[]> {
    const messagesResult = await db
        .select()
        .from(postMessages)
        .where(and(
            eq(postMessages.postId, postId),
            or(
                eq(postMessages.senderId, teacherId),
                eq(postMessages.recipientId, teacherId)
            )
        ))
        .execute();

    const conversations: { student: User, messages: Message[] }[] = [];
    const teacher = await getUserByIdWithoutCourses(teacherId);

    for(const message of messagesResult) {
        const otherUserId = message.senderId === teacherId ? message.recipientId : message.senderId;
        const student = await getUserByIdWithoutCourses(otherUserId);
        
        if(!student) continue;

        const existingConversation = conversations.find(c => c.student.id === student.id);
        
        const messageObj = {
            id: message.id,
            sender: message.senderId === teacherId ? teacher : student,
            recipient: message.recipientId === teacherId ? teacher : student,
            content: message.message,
            createdAt: message.createdAt,
        } as Message;

        if(existingConversation) {
            existingConversation.messages.push(messageObj);
        } else {
            conversations.push({
                student: student,
                messages: [messageObj]
            });
        }
    }

    conversations.forEach(conv => {
        conv.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    });

    return conversations;
}

export async function getConversationByPostIdAndUserId(postId: number, senderId: number, receipmentId: number): Promise<Message[]> {
    const messagesResult = await db
        .select()
        .from(postMessages)
        .where(and(
            eq(postMessages.postId, postId),
            or(
                and(eq(postMessages.senderId, senderId), eq(postMessages.recipientId, receipmentId)),
                and(eq(postMessages.senderId, receipmentId), eq(postMessages.recipientId, senderId))
            )
        ))
        .execute();

    const sender = await getUserByIdWithoutCourses(senderId);
    const recipient = await getUserByIdWithoutCourses(receipmentId);

    const messages = await Promise.all(messagesResult.map(async (message: any) => {        
        const senderUser = message.senderId === senderId ? sender : recipient;
        const recipientUser = message.recipientId === receipmentId ? recipient : sender;

        return {
            id: message.id,
            sender: senderUser,
            recipient: recipientUser,
            content: message.message,
            createdAt: message.createdAt,
        } as Message;
    }) as unknown as Message[]);

    messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return messages;
}

export async function sendMessageToPostConversation(postId: number, senderId: number, content: string): Promise<Message | null> {
    const post = await getPostById(postId);

    if(!post) {
        return null;
    }

    const recipientId = post.author.id === senderId ? null : post.author.id;
    if(!recipientId) {
        return null;
    }

    const result = await db
        .insert(postMessages)
        .values({
            postId: postId,
            senderId: senderId,
            recipientId: recipientId,
            message: content,
        })
        .execute();

    const messageId = result[0].insertId;

    if(!messageId) {
        return null;
    }

    return {
        id: messageId,
        sender: await getUserByIdWithoutCourses(senderId) as User,
        recipient: await getUserByIdWithoutCourses(recipientId) as User,
        content: content,
        createdAt: new Date(),
    } as Message;
}
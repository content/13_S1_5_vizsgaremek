import { eq, and } from 'drizzle-orm';
import { db } from "../../mysql";
import { Attachment, Course, CourseMember } from "@studify/types";
import { backgroundAttachments, courses, coursesMembers } from '../../schema/courses';
import { getCourseBackgroundImage } from '../attachments/attachments';
import { getPostsByCourseId } from '../posts/posts';
import { MySqlRawQueryResult } from 'drizzle-orm/mysql2';
import { getUserById, getUserByIdWithoutCourses } from '../users/users';

async function generateInvitationCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = process.env.INVITATION_CODE_LENGTH ? +process.env.INVITATION_CODE_LENGTH : 9;
    
    let invitationCode = '';
    
    const halfPoint = Math.floor(codeLength / 2);

    do {
        invitationCode = '';
        for (let i = 0; i < codeLength; i++) {
            if(i === halfPoint) {
                invitationCode += '-';
                continue;
            }

            const randomIndex = Math.floor(Math.random() * characters.length);
            invitationCode += characters.charAt(randomIndex);
        }
    } while (await doesInvitationCodeExist(invitationCode));

    return invitationCode;
}

async function doesInvitationCodeExist(code: string): Promise<boolean> {
    const result = await db
        .select()
        .from(courses)
        .where(eq(courses.invitationCode, code))
        .execute();

    return result.length > 0;
}

export async function getCourseByInvitationCode(invitationCode: string): Promise<Course | null> {
    const courses_result = await db
        .select()
        .from(courses)
        .where(eq(courses.invitationCode, invitationCode))
        .execute();

    const course = courses_result[0];

    if (!course) {
        return null;
    }

    const backgroundImage = await getCourseBackgroundImage(course.id);
    const members = await getCourseMembers(course.id);
    const posts = await getPostsByCourseId(course.id);

    return {
        id: course.id,
        name: course.name,
        invitationCode: course.invitationCode,
        backgroundImage: backgroundImage,
        members: members,
        posts: posts,
    } as unknown as Course;
}

export async function getCoursesByUserId(userId: number): Promise<Course[]> {
    const coursez = await db
        .select({
            id: courses.id,
            name: courses.name,
            invitationCode: courses.invitationCode,
        })
        .from(courses)
        .innerJoin(coursesMembers, eq(courses.id, coursesMembers.courseId))
        .where(and(eq(coursesMembers.userId, userId), eq(coursesMembers.isApproved, true)))
        .execute();

    return await Promise.all(coursez.map(async (course) => {
        let members = await getCourseMembers(course.id);
        const backgroundImage = await getCourseBackgroundImage(course.id);
        const posts = await getPostsByCourseId(course.id);

        const isUserTeacher = members.find(member => member.user?.id === userId)?.isTeacher || false;
        if(!isUserTeacher) {
            members = members.filter(member => member.isApproved);
        }

        return { 
            id: course.id,
            name: course.name,
            invitationCode: course.invitationCode,
            backgroundImage: backgroundImage,

            members: members,
            posts: posts
        }
    })) as unknown as Course[];
}

export async function getCourseMembers(courseId: number): Promise<CourseMember[]> {
    const members = await db
        .select({
            userId: coursesMembers.userId,
            isTeacher: coursesMembers.isTeacher,
        })
        .from(coursesMembers)
        .where(eq(coursesMembers.courseId, courseId))
        .execute();

    return Promise.all(members.map(async (member) => {
        const userResult = await getUserByIdWithoutCourses(member.userId);

        return {
            user: userResult,
            isTeacher: member.isTeacher,
            isApproved: member.isApproved,
        }
    })) as unknown as CourseMember[];
}

export async function isUserCourseMember(courseId: number, userId: number): Promise<boolean> {
    const result = await db
        .select()
        .from(coursesMembers)
        .where(and(eq(coursesMembers.courseId, courseId), eq(coursesMembers.userId, userId), eq(coursesMembers.isApproved, true)))
        .execute();

    return result.length > 0;
}

export async function isUserTeacher(courseId: number, userId: number): Promise<boolean> {
    const result = await db
        .select()
        .from(coursesMembers)
        .where(and(eq(coursesMembers.courseId, courseId), eq(coursesMembers.userId, userId), eq(coursesMembers.isTeacher, true), eq(coursesMembers.isApproved, true)))
        .execute();

    return result.length > 0;
}

export async function isUserPendingMember(courseId: number, userId: number): Promise<boolean> {
    const result = await db
        .select()
        .from(coursesMembers)
        .where(and(eq(coursesMembers.courseId, courseId), eq(coursesMembers.userId, userId), eq(coursesMembers.isApproved, false)))
        .execute();

    return result.length > 0;
}

export async function getCourseById(courseId: number): Promise<Course | null> {
    const courses_result = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId))
        .execute();

    const course = courses_result[0];

    if (!course) {
        return null;
    }

    const backgroundImage = await getCourseBackgroundImage(course.id);
    const members = await getCourseMembers(course.id);
    const posts = await getPostsByCourseId(course.id);

    return {
        id: course.id,
        name: course.name,
        invitationCode: course.invitationCode,
        backgroundImage: backgroundImage,
        members: members,
        posts: posts,
    } as unknown as Course;
}

export async function setBackgroundImageForCourse(courseId: number, attachment: Attachment): Promise<MySqlRawQueryResult> {
    const result = await db
        .insert(backgroundAttachments)
        .values({
            courseId: courseId,
            attachmentId: attachment.id,
        })
        .execute();

    return result[0];
}

export async function createCourse(creatorId: number, name: string, backgroundImage: Attachment | null): Promise<Course> {
    const invitationCode = await generateInvitationCode();
    const result = await db
        .insert(courses)
        .values({
            name: name,
            invitationCode: invitationCode,
        })
        .execute();

    const courseId = result[0].insertId;

    const memberResult = await db
        .insert(coursesMembers)
        .values({
            courseId: courseId,
            userId: creatorId,
            isTeacher: true,
            isApproved: true
        })
        .execute();

    const members = await getCourseMembers(courseId);

    if(backgroundImage) {
        setBackgroundImageForCourse(courseId, backgroundImage);
    }

    return {
        id: courseId,
        name: name,
        invitationCode: invitationCode,
        backgroundImage: backgroundImage,
        
        members: members,
        posts: [],
    } as unknown as Course;
}

export async function joinCourse(userId: number, invitationCode: string): Promise<Course | JSON | null> {
    const courses_result = await db
        .select()
        .from(courses)
        .where(eq(courses.invitationCode, invitationCode))
        .execute();

    const course = courses_result[0];

    if (!course) {
        return null;
    }

    const isMember = await isUserCourseMember(course.id, userId);
    if (isMember) {
        return getCourseById(course.id);
    }

    const memberResult = await db
        .insert(coursesMembers)
        .values({
            courseId: course.id,
            userId: userId,
            isApproved: false
        })
        .execute();

    return { message: "Join request sent."  } as unknown as JSON;
}

export async function approveUser(courseId: number, userId: number): Promise<boolean> {
    const result = await db
        .update(coursesMembers)
        .set({
            isApproved: true
        })
        .where(and(eq(coursesMembers.courseId, courseId), eq(coursesMembers.userId, userId)))
        .execute();

    return result.affectedRows > 0;
}

export async function declineUser(courseId: number, userId: number): Promise<boolean> {
    const result = await db
        .delete(coursesMembers)
        .where(and(eq(coursesMembers.courseId, courseId), eq(coursesMembers.userId, userId)))
        .execute();

    return result.affectedRows > 0;
}
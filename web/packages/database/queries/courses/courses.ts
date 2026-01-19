import { eq, and } from 'drizzle-orm';
import { db } from "../../mysql";
import { Course } from "@studify/types";
import { courses, coursesMembers } from '../../schema/courses';
import { getCourseBackgroundImage } from '../attachments/attachments';
import { getPostsByCourseId } from '../posts/posts';

export async function getCoursesByUserId(userId: number): Promise<Course[]> {
    const userCourses = await db
        .select({
            id: courses.id,
            name: courses.name,
            invitationCode: courses.invitationCode,
            isTeacher: coursesMembers.isTeacher,
        })
        .from(courses)
        .innerJoin(coursesMembers, eq(courses.id, coursesMembers.courseId))
        .where(eq(coursesMembers.userId, userId))
        .execute();

    return userCourses.map((course) => ({
        id: course.id,
        name: course.name,
        invitationCode: course.invitationCode,
        isTeacher: course.isTeacher,
    })) as unknown as Course[];
}

export async function getCourseMembers(courseId: number): Promise<any[]> {
    const members = await db
        .select({
            userId: coursesMembers.userId,
            isTeacher: coursesMembers.isTeacher,
        })
        .from(coursesMembers)
        .where(eq(coursesMembers.courseId, courseId))
        .execute();

    return members;
}

export async function isUserCourseMember(courseId: number, userId: number): Promise<boolean> {
    const result = await db
        .select()
        .from(coursesMembers)
        .where(and(eq(coursesMembers.courseId, courseId), eq(coursesMembers.userId, userId)))
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
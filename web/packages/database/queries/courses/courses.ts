import { eq } from 'drizzle-orm';
import { db } from "../../mysql";
import { Course } from "@studify/types";
import { courses, coursesMembers } from '../../schema/courses';

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
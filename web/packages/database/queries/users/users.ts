import { and, eq } from "drizzle-orm";
import { db } from "../../mysql";
import { users } from "../../schema/users";
import { getCoursesByUserId } from "../courses/courses";

export async function getUser(email: string) {
    const user = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email)))
        .execute();

    if (user.length === 0) {
        return null;
    }

    const userObj = user[0];

    if (typeof userObj.id !== 'number') {
        return;
    }

    const courses = await getCoursesByUserId(userObj.id);

    return {
        ...userObj,
        courses
    };
}
import { and, eq } from "drizzle-orm";
import { db } from "../../mysql";
import { users } from "../../schema/users";
import { getCoursesByUserId } from "../courses/courses";
import { User } from "@studify/types";

export async function isEmailFree(email: string): Promise<boolean> {
    const user = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email)))
        .execute();

    return user.length === 0;
}

export async function getPassword(email: string): Promise<string | null> {
    const user = await db
        .select({
            password: users.password,
        })
        .from(users)
        .where(and(eq(users.email, email)))
        .execute();

    if (user.length === 0) {
        return null;
    }

    return user[0].password;
}

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
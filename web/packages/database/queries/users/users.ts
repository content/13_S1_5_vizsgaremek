import * as bcrypt from 'bcryptjs';
import { User } from "@studify/types";
import { and, eq } from "drizzle-orm";
import { db } from "../../mysql";
import { profilePictureAttachments, users } from "../../schema/users";
import { createAttachment, createRelation } from "../attachments/attachments";
import { getCoursesByUserId } from "../courses/courses";
import { attachments } from '../../schema/attachments';

export async function createUser(email: string, password: string, firstName: string, lastName: string, profilePicture: {path: string | null, name: string | null}): Promise<User | null> {
    const results = await db
        .insert(users)
        .values({
            email,
            password,
            firstName,
            lastName
        })
        .execute();
    
    const userId = results[0].insertId;
    
    if(!(typeof userId === 'number')) {
        return null;
    }

    if(profilePicture.path && profilePicture.name) {
        await updateProfilePicture(userId, profilePicture.path, profilePicture.name);
    }
    
    return await getUser(email);
}

export async function updateProfilePicture(userId: number, profilePicturePath: string, profilePictureName: string): Promise<boolean> {
    const currentRelation = (await db
        .select()
        .from(profilePictureAttachments)
        .where(eq(profilePictureAttachments.userId, userId))
        .execute())[0];

    if(currentRelation) {
        await db
            .delete(profilePictureAttachments)
            .where(eq(profilePictureAttachments.userId, userId))
            .execute();
    }
    
    const attachmentId = (await createAttachment(userId, profilePicturePath, profilePictureName)).id;
    const relation = await createRelation({foreignId: userId, attachmentId, table: profilePictureAttachments});
    
    return typeof relation === 'number';
}

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

export async function updatePassword(userId: number, newHashedPassword: string): Promise<boolean> {
    const result = await db
        .update(users)
        .set({ password: newHashedPassword })
        .where(eq(users.id, userId))
        .execute();
    
    return result[0].affectedRows > 0;
}

export async function getUser(email: string): Promise<User | null> {
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
        return null;
    }

    const courses = await getCoursesByUserId(userObj.id);
    const profilePicture = await getProfilePictureByUserId(userObj.id);

    return {
        id: userObj.id,
        first_name: userObj.firstName,
        last_name: userObj.lastName,
        email: userObj.email,
        profile_picture: profilePicture,
        courses: courses,
        created_at: userObj.createdAt
    };
}

export async function getUserById(userId: number): Promise<User | null> {
    const user = await db
        .select()
        .from(users)
        .where(and(eq(users.id, userId)))
        .execute();

    if (user.length === 0) {
        return null;
    }

    const userObj = user[0];
    const courses = await getCoursesByUserId(userObj.id);
    const profilePicture = await getProfilePictureByUserId(userObj.id);

    return {
        id: userObj.id,
        first_name: userObj.firstName,
        last_name: userObj.lastName,
        email: userObj.email,
        profile_picture: profilePicture,
        courses: courses,
        created_at: userObj.createdAt
    } as unknown as User;
}

export async function getUserByIdWithoutCourses(userId: number): Promise<User | null> {
    const user = await db
        .select()
        .from(users)
        .where(and(eq(users.id, userId)))
        .execute();

    if (user.length === 0) {
        return null;
    }

    const userObj = user[0];
    const profilePicture = await getProfilePictureByUserId(userObj.id);
    
    return {
        id: userObj.id,
        first_name: userObj.firstName,
        last_name: userObj.lastName,
        email: userObj.email,
        profile_picture: profilePicture,
        courses: [],
        created_at: userObj.createdAt
    } as unknown as User;
}

export async function getProfilePictureByUserId(userId: number): Promise<string | null> {
    const relation = await db
        .select()
        .from(profilePictureAttachments)
        .where(eq(profilePictureAttachments.userId, userId))
        .execute();

    if (relation.length === 0) {
        return null;
    }

    const attachmentId = relation[0].attachmentId;

    const attachment = await db
        .select()
        .from(attachments)
        .where(eq(attachments.id, attachmentId))
        .execute();

    if (attachment.length === 0) {
        return null;
    }

    return attachment[0].path;
}

export async function updateName(userId: number, firstName: string, lastName: string): Promise<boolean> {
    const result = await db
        .update(users)
        .set({ firstName: firstName, lastName: lastName})
        .where(eq(users.id, userId))
        .execute();

    return result[0].affectedRows > 0;
}

export async function changeEmail(currEmail: string, newEmail: string): Promise<boolean> {
    const result = await db
        .update(users)
        .set({ email: newEmail })
        .where(eq(users.email, currEmail))
        .execute();

    return result[0].affectedRows > 0;
}
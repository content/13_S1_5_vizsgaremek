import { authConfig } from "@/app/auth";
import { Course, CourseMember } from "@studify/types";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { mergePermissions, validatePermissions } from "@/lib/permissions/utils";
import { CoursePermissions } from "@/lib/permissions/mappings";
import { db } from "@studify/database/mysql";
import { courses } from "@studify/database/schema/courses";
import { eq } from "drizzle-orm";
import { updateSettings } from "@studify/database";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const courseId = (await params).id;
    const course = session.user.courses.find((course: Course) => course.id === +courseId);

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isTeacher = course.members.some(
        (member: CourseMember) => member.user.id === session.user?.id && member.isTeacher
    );

    if (!isTeacher) {
        return NextResponse.json(
            { error: "Only teachers can modify course settings" },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        
        // Extract permission-related fields
        const permissionUpdates: Partial<CoursePermissions> = {
            allowComments: body.allowComments,
            showInviteCode: body.showInviteCode,
            studentsCanCreatePosts: body.studentsCanCreatePosts,
            autoApproveMembers: body.autoApproveMembers,
            autoRejectMembers: body.autoRejectMembers,
            allowedStudentPostTypes: body.allowedStudentPostTypes || [],
        };

        // Validate permissions
        const validation = validatePermissions(permissionUpdates);
        if (!validation.valid) {
            return NextResponse.json(
                { error: "Invalid permissions", details: validation.errors },
                { status: 400 }
            );
        }

        const mergedPermissions = mergePermissions(permissionUpdates);
        const settingsUpdateResult = updateSettings(course.id, mergedPermissions);

        if (!settingsUpdateResult) {
            return NextResponse.json(
                { error: "Failed to update course settings" },
                { status: 500 }
            );
        }

        const updatedCourse = session.user.courses.find((c: Course) => c.id === +courseId);
        if (updatedCourse) {
            (updatedCourse as any).settings = mergedPermissions;
        }

        return NextResponse.json(
            {
                success: true,
                message: "Course settings updated successfully",
                permissions: mergedPermissions,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating course settings:", error);
        return NextResponse.json(
            { error: "Failed to update course settings" },
            { status: 500 }
        );
    }
}
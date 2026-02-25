import { authConfig } from "@/app/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { hash } from "@/lib/encryption/encryption";
import { updatePassword } from "@studify/database";
import { validatePassword } from "@/lib/validators/credentials";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!validatePassword(newPassword)) {
            return NextResponse.json(
                { error: "Password does not meet requirements" },
                { status: 400 }
            );
        }

        const hashedPassword = await hash(newPassword);
        const success = await updatePassword((session.user as any).id, hashedPassword);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to update password" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Password updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
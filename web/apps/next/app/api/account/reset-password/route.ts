import { hash, verifyEmailToken } from "@/lib/encryption/encryption";
import { getUser, updatePassword } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || typeof token !== "string") {
            return NextResponse.json({ error: "Token is required and must be a string" }, { status: 400 });
        }

        if (!password || typeof password !== "string") {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
        }

        const verified = await verifyEmailToken(token);
        
        if (!verified) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const parts = verified.split("|");
        if (parts.length !== 2 || parts[0] !== "forgot-password") {
            return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
        }

        const email = parts[1];

        const user = await getUser(email);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const hashedPassword = await hash(password);

        const success = await updatePassword(user.id, hashedPassword);

        if (!success) {
            return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Password successfully changed" }, { status: 200 });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
    }
}

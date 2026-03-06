import { authConfig } from "@/app/auth";
import { changeProfilePicture } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authConfig);
            
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { profilePicture } = await request.json();

    if (!profilePicture || typeof profilePicture !== "string") {
        return NextResponse.json(
            { error: "Invalid profile picture URL" },
            { status: 400 }
        );
    }

    const success = await changeProfilePicture(session.user.id, profilePicture, "profile_picture");

    if (!success) {
        return NextResponse.json(
            { error: "Failed to update profile picture" },
            { status: 500 }
        );
    }

    return NextResponse.json({ message: "Profile picture updated successfully" });
}
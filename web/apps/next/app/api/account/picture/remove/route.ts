import { authConfig } from "@/app/auth";
import { removeProfilePicture } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authConfig);

    if(!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await removeProfilePicture(session.user.id);

    if(!success) {
        return NextResponse.json({ error: "Failed to remove profile picture" }, { status: 500 });
    }

    return NextResponse.json({ message: "Profile picture removed" });
}
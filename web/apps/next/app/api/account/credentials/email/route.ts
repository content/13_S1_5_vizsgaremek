import { authConfig } from "@/app/auth";
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

    const currEmail = session.user.email;
    const { newEmail } = await request.json();
    
    try {
        // TODO: Send verification email to new email address and update email in database after verification
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }

    return NextResponse.json({ message: "Verification email sent to new email address" });
}
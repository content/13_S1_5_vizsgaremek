import { authConfig } from "@/app/auth";
import { createCourse } from "@studify/database";
import { getServerSession } from "next-auth";
import { createAttachment } from "@studify/database";
import { fireWebsocketEvent } from "@/lib/websocket/websocket";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }


    const body = await req.json();

    const {name, backgroundImagePath } = body;
    
    const user = session.user as any;
    const userId = user.id;

    let backgroundImage = null;

    if(backgroundImagePath) {
        backgroundImage = await createAttachment(userId, backgroundImagePath, name);
    }

    const course = await createCourse(userId, name, backgroundImage);

    await fireWebsocketEvent("course-created", course);

    return NextResponse.json(course);
}
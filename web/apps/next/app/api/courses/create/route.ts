import { createCourse } from "@studify/database";
import { createAttachment } from "@studify/database/queries/attachments/attachments";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    
    const { userId, name, backgroundImagePath } = body;
    
    let backgroundImage = null;
    if(backgroundImagePath) {
        backgroundImage = await createAttachment(userId, backgroundImagePath);
    }

    const course = await createCourse(userId, name, backgroundImage);

    return NextResponse.json(course);
}
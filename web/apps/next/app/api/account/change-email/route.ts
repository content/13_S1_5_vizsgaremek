import { authConfig } from "@/app/auth";
import ChangeEmail from "@/components/emails/change-email";
import { sendEmail } from "@/lib/email/email";
import { generateVerificationToken } from "@/lib/encryption/encryption";
import { render } from "@react-email/components";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authConfig);

    if(!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail } = await request.json();

    if(!newEmail || typeof newEmail !== "string") {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if(newEmail === session.user.email) {
        return NextResponse.json({ error: "New email cannot be the same as the current email" }, { status: 400 });
    }

    const token = await generateVerificationToken(`change-email|${session.user.email}|${newEmail}`);

    const emailHtml = await render(ChangeEmail({
        verifyHash: token,
        newEmail,
        firstName: session.user.first_name,
        lastName: session.user.last_name,
    }));

    const sendResult = await sendEmail(newEmail, "Studify - Email cím megerősítése", emailHtml);

    if(sendResult) {
        return NextResponse.json({ message: "Verification email sent" });
    }
    
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
}
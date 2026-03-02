import ForgotPasswordEmail from "@/components/emails/forgot-password";
import { sendEmail } from "@/lib/email/email";
import { generateVerificationToken } from "@/lib/encryption/encryption";
import { render } from "@react-email/components";
import { getUser } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    if(!email || typeof email !== "string") {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUser(email);

    if(!user) {
        // To prevent email enumeration, we return a success response even if the user doesn't exist
        return NextResponse.json({ success: true });
    }

    const firstName = user.first_name;
    const lastName = user.last_name;

    const token = await generateVerificationToken(`forgot-password|${email}`, "1h");
    const emailHtml = await render(ForgotPasswordEmail({resetToken: token, firstName, lastName }));

    const success = await sendEmail(email, "Studify - Jelszó visszaállítás", emailHtml);
    if (success) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
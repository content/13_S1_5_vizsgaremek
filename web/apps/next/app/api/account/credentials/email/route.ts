import { authConfig } from "@/app/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import ChangeEmail from "@/components/emails/change-email";
import { createTransport } from "nodemailer";
import { render } from "@react-email/render";
import { generateVerificationToken } from "@/lib/encryption/encryption";
import { Messages } from "@/lib/localization/messages";
import { getUser } from "@studify/database";
import { sendEmail } from "@/lib/email/email";

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
    
    if(await getUser(newEmail)) {
            return NextResponse.json({ error: Messages.Auth_Register_EmailAlreadyInUse }, { status: 400 });
    }

    try {
        const hash = await generateVerificationToken(`change-email|${currEmail}|${newEmail}`, "1h");

        const emailHtml = await render(ChangeEmail({
            firstName: session.user.first_name,
            lastName: session.user.last_name,
            newEmail,
            verifyHash: hash
        }));

        const response = await sendEmail(newEmail, "Studify - Email cím változtatás megerősítése", emailHtml);

        if(response.accepted.length > 0) {
            return NextResponse.json({ 
                message: "Sikeresen elküldtük a megerősítő emailt. Kérjük ellenőrizd a postaládádat!" 
            }, { status: 200 });
        } else {
            return NextResponse.json({ 
                error: "Hiba történt az email küldése során. Próbáld újra később!" 
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }

    return NextResponse.json({ message: "Verification email sent to new email address" });
}
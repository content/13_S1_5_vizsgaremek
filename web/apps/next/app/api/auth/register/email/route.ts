import VerifyEmail from "@/components/emails/verify-email";
import { renderEmail, sendEmail } from "@/lib/email/email";
import { generateVerificationToken } from "@/lib/encryption/encryption";
import { Messages } from "@/lib/localization/messages";
import { validateEmail, validateName } from "@/lib/validators/credentials";
import { getUser } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { firstName, lastName, email } = await request.formData().then((data) => {
        return {
            firstName: data.get('firstName') as string,
            lastName: data.get('lastName') as string,
            email: data.get('email') as string,
        }
    });

    if(await getUser(email)) {
            return NextResponse.json({ error: Messages.Auth_Register_EmailAlreadyInUse }, { status: 400 });
    }

    if(!validateEmail(email)) {
        return NextResponse.json({ error: Messages.Auth_Register_InvalidEmail }, { status: 400 });
    }

    if(!validateName(firstName) || !validateName(lastName)) {
        return NextResponse.json({ error: Messages.Auth_Register_InvalidName }, { status: 400 });
    }

    const verifyHash = await generateVerificationToken(`${firstName}|${lastName}|${email}`);
    const emailContent = await renderEmail(VerifyEmail({ firstName, lastName, verifyHash }));

    if(!verifyHash || !emailContent) {
        return NextResponse.json({ 
            error: "Hiba történt a regisztráció során. Próbáld újra később!" 
        }, { status: 500 });
    }

    const response = await sendEmail(email, "Studify - Email cím megerősítése", emailContent);

    if(response.accepted.length > 0) {
        return NextResponse.json({ 
            message: "Sikeresen elküldtük a megerősítő emailt. Kérjük ellenőrizd a postaládádat!" 
        }, { status: 200 });
    } else {
        return NextResponse.json({ 
            error: "Hiba történt az email küldése során. Próbáld újra később!" 
        }, { status: 500 });
    }
}
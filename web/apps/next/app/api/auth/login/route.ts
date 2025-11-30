import { getPassword, isEmailFree } from '@studify/database';
import { comparePasswords } from '@/lib/encryption/encryption';
import { Messages } from '@/lib/localization/messages';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { email, password } = body;

    if (await isEmailFree(email)) {
        return NextResponse.json({
            message: Messages.Auth_UserNotFoundWithUsername,
            success: false,
        }, { status: 404 });
    }

    const hashedPassword = (await getPassword(email)) || '';
    if (!(await comparePasswords(password, hashedPassword))) {
        return NextResponse.json({
            message: Messages.Auth_PasswordWrong,
            success: false,
        }, { status: 401 });
    }

    return NextResponse.json({
        message: Messages.Auth_SuccessfulLogin,
        success: true,
    }, { status: 200 });
}
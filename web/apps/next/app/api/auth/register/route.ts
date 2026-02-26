import { NextResponse, NextRequest } from 'next/server';
import { validateEmail, validateName, validatePassword } from '@/lib/validators/credentials';
import { createUser, getUser } from '@studify/database';
import { Messages } from '@/lib/localization/messages';
import { hash, verifyEmailToken } from '@/lib/encryption/encryption';

export async function POST(request: NextRequest) {
    const { token, password, firstName, lastName, email, profilePicture } = await request.formData().then(async (data) => {
        const _token = data.get('token') as string | null;
        
        const invalidResponse = { token: null, password: null, firstName: null, lastName: null, email: null, profilePicture: {path: null, name: null} };

        if(!_token) {
            return invalidResponse;
        }

        const solvedToken = await verifyEmailToken(_token);

        if(!solvedToken) {
            return invalidResponse;
        }

        const parts = solvedToken.split("|");
        const firstName = parts[0];
        const lastName = parts[1];
        const email = parts[2];
        
        return {
            token: solvedToken,
            firstName,
            lastName,
            email,
            password: data.get('password') as string,
            profilePicture: {path: data.get('profile_picture'), name: data.get('profile_picture_file_name')} as {path: string | null, name: string | null},
        };
    });
    
    if(!token) {
        return NextResponse.json({ error: "Helytelen token"}, { status: 400 });
    }

    if(await getUser(email)) {
        return NextResponse.json({ error: Messages.Auth_Register_EmailAlreadyInUse }, { status: 400 });
    }

    console.log(email);

    if(!validateEmail(email)) {
        return NextResponse.json({ error: Messages.Auth_Register_InvalidEmail }, { status: 400 });
    }

    if(!validateName(firstName) || !validateName(lastName)) {
        return NextResponse.json({ error: Messages.Auth_Register_InvalidName }, { status: 400 });
    }

    if(!validatePassword(password)) {
        return NextResponse.json({ error: Messages.Auth_Register_WeakPassword }, { status: 400 });
    }

    const hashedPassword = await hash(password);

    try {
        const user = await createUser(
            email,
            hashedPassword,
            firstName,
            lastName,
            profilePicture,
        );

        return NextResponse.json({ 
            message: 'User registered successfully', 
            user 
        }, { status: 201 }); 
    } catch (error) {
        console.error('Error registering user:', error);
        
        return NextResponse.json({ 
            error: Messages.Auth_Register_ServerError 
        }, { status: 500 });
    }
}
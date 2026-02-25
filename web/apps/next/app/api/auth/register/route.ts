import { NextResponse, NextRequest } from 'next/server';
import { validateEmail, validateName, validatePassword } from '@/lib/validators/credentials';
import { createUser, getUser } from '@studify/database';
import { Messages } from '@/lib/localization/messages';
import { hash } from '@/lib/encryption/encryption';

export async function POST(request: NextRequest) {
    const { email, password, firstName, lastName, profilePicture } = await request.formData().then((data) => {
        return {
            email: data.get('email') as string,
            password: data.get('password') as string,
            firstName: data.get('firstName') as string,
            lastName: data.get('lastName') as string,
            profilePicture: {path: data.get('profile_picture'), name: data.get('profile_picture_file_name')} as {path: string | null, name: string | null},
        };
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
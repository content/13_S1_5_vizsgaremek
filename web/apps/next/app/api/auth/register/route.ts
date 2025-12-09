import { NextResponse, NextRequest } from 'next/server';
import { validateEmail, validateName, validatePassword } from '@/lib/validators/credentials';
import { createUser } from '@studify/database';

export async function POST(request: NextRequest) {
    const { email, password, firstName, lastName, profilePicture } = await request.json();

    if(!validateEmail(email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if(!validateName(firstName) || !validateName(lastName)) {
        return NextResponse.json({ error: 'Invalid name provided' }, { status: 400 });
    }

    if(!validatePassword(password)) {
        return NextResponse.json({ error: 'Password does not meet criteria' }, { status: 400 });
    }

    try {
        await createUser(
            email,
            password,
            firstName,
            lastName,
            profilePicture,
        );

        return NextResponse.json({ message: 'User registered successfully' }, { status: 201 }); 
    } catch (error) {
        return NextResponse.json({ error: 'Error registering user' }, { status: 500 });
    }
}
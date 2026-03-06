import { authConfig } from "@/app/auth";
import { validateName } from "@/lib/validators/credentials";
import { updateName } from "@studify/database";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authConfig);
            
    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { firstName, lastName } = await request.json();

    if(validateName(firstName) || validateName(lastName)) {
        return NextResponse.json(
            { error: "Helytelen névformátum" },
            { status: 400 }
        );
    }

    if(session.user.first_name === firstName && session.user.last_name === lastName) {
        return NextResponse.json(
            { error: "Az új név nem lehet ugyanaz, mint a jelenlegi név" },
            { status: 400 }
        );
    }

    const success = await updateName(session.user.id, firstName, lastName);

    if(!success) {
        return NextResponse.json(
            { error: "Nem sikerült frissíteni a nevet" },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { message: "Név sikeresen frissítve" },
        { status: 200 }
    );
}
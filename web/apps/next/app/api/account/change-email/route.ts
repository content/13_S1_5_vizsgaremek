import { verifyEmailToken } from "@/lib/encryption/encryption";
import { changeEmail } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { token } = await request.json();

    const solvedToken = await verifyEmailToken(token);
    
    if(!solvedToken || !solvedToken.startsWith("change-email|")) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const parts = solvedToken.split("|");

    if(parts.length !== 3) {
        return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
    }

    const currEmail = parts[1];
    const newEmail = parts[2];

    const success = await changeEmail(currEmail, newEmail);

    if(success) {
        return NextResponse.json({ message: "Email cím sikeresen megváltoztatva!" });
    } else {
        return NextResponse.json({ error: "Nem sikerült megváltoztatni az email címet" }, { status: 500 });
    }
}

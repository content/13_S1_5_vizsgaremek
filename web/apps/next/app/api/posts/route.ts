import { getPostTypes } from "@studify/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const types = await getPostTypes();

    if(!types) {
        return NextResponse.json({ error: 'Could not retrieve post types' }, { status: 500 });
    }

    return NextResponse.json({ postTypes: types }, { status: 200 });
}
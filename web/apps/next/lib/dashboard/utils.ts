import { Course } from "@studify/types";

export async function createCourse(creatorId: number, name: string, backgroundImageUrl: string | null): Promise<Course | null> {
    const response = await fetch("/api/courses/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: creatorId,
            name: name,
            backgroundImagePath: backgroundImageUrl,
        }),
    });

    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}

export async function joinCourse(userId: number, invitationCode: string): Promise<Course | null> {
    const response = await fetch("/api/courses/join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            invitationCode,
        }),
    });

    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}

export function generateColorFromInvitationCode(code: string): { bg: string; text: string, neutralBgText: string } {
    const colors = [
        { bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500', text: 'text-white', neutralBgText: "!text-blue-500 hover:text-purple-500" },
        { bg: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500', text: 'text-white', neutralBgText: "!text-green-500 hover:text-teal-500" },
        { bg: 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500', text: 'text-white', neutralBgText: "!text-red-500 hover:text-rose-500" },
        { bg: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400', text: 'text-black', neutralBgText: "!text-yellow-400 hover:text-red-400" },
        { bg: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500', text: 'text-white', neutralBgText: "!text-cyan-400 hover:text-blue-500" },
        { bg: 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500', text: 'text-white', neutralBgText: "!text-purple-400 hover:text-pink-500" },
    ]

    let hash = 0

    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}
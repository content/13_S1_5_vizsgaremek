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

export async function getContrastColor(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const img = document.createElement("img");
    const url = URL.createObjectURL(blob);
    img.src = url;

    return new Promise((resolve) => {
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let r = 0, g = 0, b = 0;
                for (let i = 0; i < imageData.data.length; i += 4) {
                    r += imageData.data[i];
                    g += imageData.data[i + 1];
                    b += imageData.data[i + 2];
                }
                const pixelCount = imageData.data.length / 4;
                r = Math.round(r / pixelCount);
                g = Math.round(g / pixelCount);
                b = Math.round(b / pixelCount);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                resolve(brightness > 125 ? "#000000" : "#FFFFFF");
            }
            URL.revokeObjectURL(url);
        };
    });
}

export function generateColorFromInvitationCode(code: string): string {
    const colors = [
        "#6366F1",
        "#10B981",
        "#EF4444",
        "#F59E0B",
        "#06B6D4",
        "#A855F7",
    ];

    if (!code) return colors[0];

    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export function getColorsFromColorCode(colorCode: string): { bg: string; text: string, neutralBgText: string } {
    const colorMap: Record<string, { bg: string; text: string, neutralBgText: string }> = {
        "#6366F1": { bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500', text: 'text-white', neutralBgText: "!text-blue-500 hover:text-purple-500" },
        "#10B981": { bg: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500', text: 'text-white', neutralBgText: "!text-green-500 hover:text-teal-500" },
        "#EF4444": { bg: 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500', text: 'text-white', neutralBgText: "!text-red-500 hover:text-rose-500" },
        "#F59E0B": { bg: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400', text: 'text-black', neutralBgText: "!text-yellow-400 hover:text-red-400" },
        "#06B6D4": { bg: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500', text: 'text-white', neutralBgText: "!text-cyan-400 hover:text-blue-500" },
        "#A855F7": { bg: 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500', text: 'text-white', neutralBgText: "!text-purple-400 hover:text-pink-500" },
    };

    return colorMap[colorCode] || colorMap["#6366F1"];
}

export function generateColorFromInvitationCode11(code: string): { bg: string; text: string, neutralBgText: string } {
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
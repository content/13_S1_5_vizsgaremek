import { Course } from "@studify/types";
import React from "react";

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

export function generateColorFromInvitationCode(code: string): string {
    const colors = [
        "#6366F1",
        "#10B981",
        "#EF4444",
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

export function getColorsFromColorCode(colorCode: string): { bg: React.CSSProperties; text: string, neutralBgText: string } {
    const hex = colorCode.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 128 ? 'text-black' : 'text-white';
    
    const middle = lightenColor(colorCode, 12).toUpperCase();
    const lighter = lightenColor(colorCode, 25).toUpperCase();
    
    return {
        bg: {
            backgroundImage: `linear-gradient(135deg, ${colorCode}, ${middle}, ${lighter})`,
        },
        text: textColor,
        neutralBgText: colorCode
    };
}

function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
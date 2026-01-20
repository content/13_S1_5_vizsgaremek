export async function createCourse(creatorId: number, name: string, backgroundImageUrl: string | null): Promise<Course> {
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
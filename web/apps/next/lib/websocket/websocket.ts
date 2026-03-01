"use server";


export async function fireWebsocketEvent(event: string, data: any, room?: string) {
    const response = await fetch(`${process.env.WS_URL}/api/websocket/event`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ event, data, room }),
    });

    if (!response.ok) {
        console.error("Failed to fire websocket event", await response.text());
    }
}
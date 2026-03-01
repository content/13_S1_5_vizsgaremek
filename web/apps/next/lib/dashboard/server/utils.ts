"use server";

export async function getContrastColor(imageUrl: string): Promise<string> {
    try {
        const sharp = (await import('sharp')).default;
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        
        // Extract average color from image by resizing to 1x1
        const { data } = await sharp(Buffer.from(buffer))
            .resize(1, 1, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        const r = data[0];
        const g = data[1];
        const b = data[2];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 125 ? "#000000" : "#FFFFFF";
    } catch (error) {
        console.error('Error getting contrast color:', error);
        return "#FFFFFF";
    }
}
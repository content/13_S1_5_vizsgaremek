export async function getDominantColor(imageUrl: string): Promise<string> {
    try {
        const sharp = (await import('sharp')).default;
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        
        // Convert to RGB and resize
        const image = sharp(Buffer.from(buffer)).resize(50, 50, { fit: 'cover' }).toColorspace('srgb');
        
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        // Calculate average color from all pixels
        let r = 0, g = 0, b = 0;
        const channels = info.channels; // Will be 3 for RGB or 4 for RGBA
        const pixelCount = (data.length / channels);
        
        for (let i = 0; i < data.length; i += channels) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        
        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);
        
        // Clamp values to 0-255 range
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        // Convert to hex color
        const hex = '#' + [r, g, b].map(x => {
            const hexVal = Math.round(x).toString(16);
            return hexVal.length === 1 ? '0' + hexVal : hexVal;
        }).join('').toUpperCase();
        
        return hex;
    } catch (error) {
        console.error('Error getting dominant color:', error);
        return "#999999";
    }
}

import { useEffect, useState } from "react";

type MCAvatarProps = {
    skinURL: string;
    username: string;
    size?: number;
    className?: string;
}

const MCAvatar = ({ skinURL, username, size=64, className="" }: MCAvatarProps) => {
    const [skinSize, setSkinSize] = useState({ width: 64, height: 64 });

    const headTopPos = [1, 1];
    const headBottomPos = [8, 8];

    const secLayerBottomPos = [40, 8];

    useEffect(() => {
        const img = new Image();
        img.src = skinURL;
        img.onload = () => {
            setSkinSize({ 
                width: img.width || 64, 
                height: img.height || 64 
            });
        }
    }, [skinURL]);

    const cropW = headBottomPos[0] - headTopPos[0] + 1;
    const scale = size / cropW;
    const bgW = Math.round(skinSize.width * scale);
    const bgH = Math.round(skinSize.height * scale);
    const posX = Math.round(-(headBottomPos[0] * scale));
    const posY = Math.round(-(headBottomPos[1] * scale));

    const posXSec = Math.round(-(secLayerBottomPos[0] * scale));
    const posYSec = Math.round(-(secLayerBottomPos[1] * scale));

    return (
        <div className={`relative h-max flex items-center justify-center rounded-2xl overflow-hidden p-1 ${className}`}>
            <div
                aria-hidden="true" 
                title={`${username} feje`}
                className="rounded-xl aspect-square shadow-lg"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundImage: `url(${skinURL})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${bgW}px ${bgH}px`,
                    backgroundPosition: `${posX}px ${posY}px`,
                    imageRendering: 'pixelated',
                    zIndex: 0
                }}
            />
            <div
                aria-hidden="true" 
                title={`${username} feje`}
                className="absolute rounded-xl aspect-square shadow-lg"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundImage: `url(${skinURL})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${bgW}px ${bgH}px`,
                    backgroundPosition: `${posXSec}px ${posYSec}px`,
                    imageRendering: 'pixelated',
                    zIndex: 1
                }}
            />
        </div>
    );
};


export default MCAvatar;
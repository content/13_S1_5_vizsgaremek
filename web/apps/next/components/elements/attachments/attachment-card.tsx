import { Card, CardContent } from "@/components/ui/card";
import { Attachment } from "@studify/types";
import { File } from "lucide-react";
import Image from "next/image";
import AttachmentPreviewDialog from "./attachment-preview-dialog";
import { useState } from "react";

type AttachmentCardProps = {
    attachment: Attachment;
    size?: 'small' | 'medium' | 'large';
}

export default function AttachmentCard({ attachment, size = 'medium' }: AttachmentCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const extension = attachment.name.split('.').pop()?.toLowerCase();

    const sizeMappings = {
        small: 'h-32 w-24',
        medium: 'h-40 w-32',
        large: 'h-52 w-40',
    }

    const isImage = extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'bmp' || extension === 'svg';

    return (
        <AttachmentPreviewDialog attachment={attachment} isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <Card className="overflow-hidden" onClick={() => setIsOpen(true)}>
                <CardContent className={`relative p-0 ${sizeMappings[size]} overflow-hidden cursor-pointer group`}>
                    <div className="flex items-center justify-center h-[70%] w-full relative">
                        <div className="flex justify-center items-center w-full h-full bg-primary/10 p-7">
                            {isImage && (
                                <Image 
                                    src={attachment.path} 
                                    fill 
                                    alt={attachment.name} 
                                    className="object-cover overflow-hidden select-none"
                                    draggable={false}
                                />
                            )}
                            {!isImage && (
                                <File className="h-8 w-8"></File>
                            )}
                        </div>
                        
                    </div>
                    <div className="flex p-4 items-center z-1 bg-primary/5 w-auto h-[30%] text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        <p className="w-full overflow-hidden text-ellipsis">
                            {attachment.name || 'Fájlnév ismeretlen'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </AttachmentPreviewDialog>        
    )
}
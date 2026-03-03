import { Button } from "@/components/ui/button";
import { File, Trash2 } from "lucide-react";
import AttachmentPreviewDialog from "./attachment-preview-dialog";
import { useState } from "react";
import Image from "next/image";

type SubmissionAttachmentCardProps = {
    name: string;
    url: string;
    showRemoveButton?: boolean;
    onRemove: (name: string, url: string) => void;
}

export default function SubmissionAttachmentCard({ name, url, showRemoveButton = true, onRemove }: SubmissionAttachmentCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const extension = name.split('.').pop()?.toLowerCase();
    const isImage = extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'bmp' || extension === 'svg';

    return (
        <AttachmentPreviewDialog attachment={{ name, path: url, uploadedAt: new Date(), uploaderId: 0, id: 0 }} isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div className="flex items-center justify-between mb-2 p-2 border border-border rounded-md cursor-pointer" onClick={() => setIsOpen(true)}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isImage ? (
                        <div className="relative w-10 h-10 shrink-0">
                            <Image src={url} alt={name} fill className="object-cover rounded-md" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-muted rounded-md">
                            <File className="w-4 h-4 text-muted-foreground" />
                        </div>
                    )}

                    <span className="font-medium truncate">{name}</span>
                </div>
                {showRemoveButton && (
                <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(name, url);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                )}
            </div>
        </AttachmentPreviewDialog>
    )
}
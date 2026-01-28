import { Button } from "@/components/ui/button";
import { File, Trash2 } from "lucide-react";

type AttachmentUploadCardProps = {
    name: string;
    url: string;
    type: string;
    onRemove: (name: string) => void;
}

export default function AttachmentUploadCard({ name, url, type, onRemove }: AttachmentUploadCardProps) {
    return (
        <div className="flex items-center justify-between mb-2 p-2 border border-border rounded-md">
            <div className="flex items-center">
                {type === "image/png" || type === "image/jpeg" || type === "image/jpg" ? (
                    <img src={url || undefined} alt={name} className="w-10 h-10 object-cover rounded-md mr-4" />
                ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md mr-4">
                        <span className="text-sm text-muted-foreground">
                            <File className="w-4 h-4"></File>
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2 w-auto">
                    <span className="font-medium w-full overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
                </div>
            </div>
            <Button 
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed" 
                onClick={() => {
                    onRemove(name);
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
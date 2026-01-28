import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Attachment } from "@studify/types";
import { FileMinus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type AttachmentPreviewDialogProps = {
    attachment: Attachment;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export default function AttachmentPreviewDialog({ attachment, children, isOpen, onClose }: AttachmentPreviewDialogProps) {
    const extension = attachment.fileName.split('.').pop()?.toLowerCase();

    const isImage = extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'bmp' || extension === 'svg';
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {attachment.fileName || 'Fájlnév ismeretlen'}
                    </DialogTitle>
                </DialogHeader>
                <div>
                    {isImage ? (
                        <Image 
                            src={attachment.path}
                            alt={attachment.fileName}
                            width={800}
                            height={600}
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col justify-center items-center p-5">
                                <div className="rounded-full w-16 h-16 bg-primary/10 flex justify-center items-center mb-4">
                                    <FileMinus className="h-8 w-8" />
                                </div>
                                <p className="text-center text-sm ">Előnézet nem elérhető</p>
                                <Link href={attachment.path} target="_blank" className="mt-4" download={true}>
                                    <Button 
                                        variant="default"
                                    >
                                        Letöltés
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>       
    )
}
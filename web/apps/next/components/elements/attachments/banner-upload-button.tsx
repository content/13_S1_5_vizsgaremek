import { cn } from "@/lib/utils";
import ImageUploadButton from "./image-upload-button";

type BannerUploadButtonProps = {
    onUpload: (file: File) => void;
    className?: string;
    defaultImage?: string;
}

export default function BannerUploadButton({ className, onUpload, defaultImage }: BannerUploadButtonProps) {
    return (
        <ImageUploadButton
            onUpload={onUpload}
            defaultImage={defaultImage}

            styles={
                {
                    container: cn("", className),
                    imageWrapper: 'border-dashed bg-background hover:bg-accent/50 transition-colors h-32 w-full rounded-lg flex justify-center items-center',
                    buttonOverlay: 'group absolute top-0 size-full rounded-lg',
                    uploadButton: 'flex h-full w-full items-center rounded-lg bg-zinc-900/10 font-medium text-white opacity-0 backdrop-blur-sm transition-all hover:border hover:!bg-black/70 group-hover:opacity-100',
                    icon: 'size-10 text-center',
                }
            }

            croppable={true} 
            aspectRatio={499 / 85}
        />
    )
}
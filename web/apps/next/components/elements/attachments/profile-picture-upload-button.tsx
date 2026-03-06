import { cn } from "@/lib/utils";
import ImageUploadButton from "./image-upload-button";
import { CircleUserRound } from "lucide-react";

type ProfilePictureUploadButtonProps = {
    onUpload: (file: File) => void;
    className?: string;
    defaultImage?: string;
}

export default function ProfilePictureUploadButton({ className, onUpload, defaultImage }: ProfilePictureUploadButtonProps) {
    return (
        <ImageUploadButton
            onUpload={onUpload}
            defaultImage={defaultImage}

            styles={
                {
                    container: "size-32",
                    imageWrapper: "",

                    buttonOverlay: "w-full rounded-full sm:size-32",
                    uploadButton: "w-full text-center",
                    icon: "text-center",
                }
            }

            croppable={true} 
            aspectRatio={1}
            icon={CircleUserRound}
        />
    )
}
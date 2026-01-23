import { User } from "@studify/types";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type AvatarProps = {
    user: User;
    className?: string;
    size?: "small" | "medium" | "large";
}

export function UserAvatar({user, className, size="medium"}: AvatarProps) {
    const sizes = {
        small: "h-6 w-6",
        medium: "h-8 w-8",
        large: "h-12 w-12",
    };

    className = `${sizes[size]} ${className ? className : ""}`;

    let annotation = user.first_name.charAt(0).toUpperCase();

    for (const name of user.last_name.split(" ")) {
        annotation += name.charAt(0).toUpperCase();
    }

    return (
        user.profile_picture ? (
            <Avatar className={`${className}`}>
                <AvatarImage src={user.profile_picture} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">{annotation}</AvatarFallback>
            </Avatar>
        ) : ( 
            <div className={`flex items-center justify-center bg-gray-300 rounded-full ${className}`}>
                <span className="text-sm font-medium text-white">{annotation}</span>
            </div>
        )
    )
}
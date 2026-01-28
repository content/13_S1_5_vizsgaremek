import { CardHeader, CardTitle } from "@/components/ui/card";
import PostTypeMappings from "@/lib/dashboard/courseTypeMappings";
import { generateColorFromInvitationCode } from "@/lib/dashboard/utils";
import { Course, Post } from "@studify/types";

type PostCardHeaderProps = {
    course: Course;
    post: Post;
}

export function PostCardHeader({ course, post }: PostCardHeaderProps) {
    const type = post.postType.name;
    const colors = generateColorFromInvitationCode(course.invitationCode);
    
    const mappings = PostTypeMappings;

    const IconComponent = mappings[type].icon;

    return (
        <CardHeader className="flex flex-row items-center space-x-3 pb-3">
            <div className={`${colors.bg} p-1 rounded-lg w-10 h-10 flex items-center justify-center`}>
                <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
                <CardTitle className="text-lg m-0">{post.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{mappings[type].title}</p>
            </div>
        </CardHeader>
    )
}
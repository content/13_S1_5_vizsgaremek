import { CardHeader, CardTitle } from "@/components/ui/card";
import PostTypeMappings from "@/lib/dashboard/courseTypeMappings";
import { generateColorFromInvitationCode } from "@/lib/dashboard/utils";
import { Course, Post, Submission } from "@studify/types";

type PostCardHeaderProps = {
    course: Course;
    post: Post;
    submission?: Submission;
    showCourseName?: boolean;
}

export function PostCardHeader({ course, post, submission, showCourseName=false }: PostCardHeaderProps) {
    const type = post.postType.name;
    const colors = generateColorFromInvitationCode(course.invitationCode);
    
    const mappings = PostTypeMappings;

    const authorName = post.author.first_name + " " + post.author.last_name;

    const IconComponent = mappings[type].icon;

    return (
        <CardHeader className={`flex flex-row justify-between items-center p-0 px-6 ${post.description ? "pt-6 pb-3" : "py-6"}`}>
            <div className={`flex items-center space-x-3 ${post.description ? "" : ""}`}>
                <div className={`${colors.bg} p-1 rounded-lg w-10 h-10 flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <CardTitle className="text-lg m-0">{post.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{mappings[type].title} • {authorName} {showCourseName && `• ${course.name}`}</p>
                </div>
            </div>
            {post.maxScore && (
            <div>
                <div className="bg-primary/10 rounded-lg p-3">
                    <span className="font-medium text-primary">{submission?.score || 0} <span className="text-muted-foreground">/</span> {post.maxScore}</span>
                </div>
            </div>
            )}
        </CardHeader>
    )
}
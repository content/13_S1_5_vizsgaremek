import { Course, Post, Submission } from '@studify/types';

import { Card, CardContent } from '@/components/ui/card';
import PostTypeMappings from '@/lib/dashboard/courseTypeMappings';
import { generateColorFromInvitationCode } from '@/lib/dashboard/utils';
import Link from 'next/link';
import { PostCardHeader } from './post-card-header';

type PostCardProps = {
    course: Course;
    post: Post;
    submission?: Submission;
    showCourseName?: boolean;
}

export default function PostCard({ course, post, submission, showCourseName=false }: PostCardProps) {
    const type = post.postType.name;
    const colors = generateColorFromInvitationCode(course.invitationCode);

    const mappings = PostTypeMappings;

    const IconComponent = mappings[type].icon;

    return (
        <Link href="/dashboard/[courseId]/[postId]" as={`/dashboard/${course.id}/${post.id}`}>
            <Card className="hover:bg-primary/10 hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <PostCardHeader course={course} post={post} submission={submission} showCourseName={showCourseName} />
                {post.description && (
                    <CardContent className="px-6">
                        <p>{post.description}</p>
                    </CardContent>
                )}
            </Card>
        </Link>
    )
        
    ;
}
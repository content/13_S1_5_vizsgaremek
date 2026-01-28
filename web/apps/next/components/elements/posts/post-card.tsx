import { Course, Post } from '@studify/types';

import { BookMarked, Brain, ChartBarIncreasing, Megaphone, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateColorFromInvitationCode } from '@/lib/dashboard/utils';
import Link from 'next/link';
import PostTypeMappings from '@/lib/dashboard/courseTypeMappings';
import { PostCardHeader } from './post-card-header';

type PostCardProps = {
    course: Course;
    post: Post;
}

export default function PostCard({ course, post }: PostCardProps) {
    const type = post.postType.name;
    const colors = generateColorFromInvitationCode(course.invitationCode);

    const mappings = PostTypeMappings;

    const IconComponent = mappings[type].icon;

    return (
        <Link href="/dashboard/[courseId]/[postId]" as={`/dashboard/${course.id}/${post.id}`}>
            <Card className="hover:bg-primary/10 hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <PostCardHeader course={course} post={post} />
                <CardContent className="px-6">
                    <p>{post.description}</p>
                </CardContent>
            </Card>
        </Link>
    )
        
    ;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Post, Course, Attachment, Submission } from '@studify/types';
import { PostCardHeader } from './post-card-header';
import AttachmentCard from '../attachments/attachment-card';

type PostDetailsCardProps = {
    course: Course;
    post: Post;
    submission?: Submission;
}

export default function PostDetailsCard({ course, post, submission }: PostDetailsCardProps) {

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <PostCardHeader course={course} post={post} submission={submission} />
                <CardContent className="px-6">
                    <div>
                        <p>{post.description}</p>
                    </div>
                    {post.attachments.length > 0 && (
                    <div className='mt-7'>
                        <div>
                            <h1 className='text-md font-bold'>Csatolmányok</h1>
                            <p className='text-sm text-muted-foreground mb-4'>A poszthoz csatolt fájlok listája</p>
                        </div>
                        <div className='w-full flex flex-wrap gap-3 pe-5'>
                            {post.attachments.map((attachment: Attachment) => ( 
                                <AttachmentCard key={attachment.id} attachment={attachment}></AttachmentCard>
                            ))}
                        </div>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
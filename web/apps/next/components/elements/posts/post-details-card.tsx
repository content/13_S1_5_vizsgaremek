import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Post, Course, Attachment, Submission, Comment } from '@studify/types';
import { PostCardHeader } from './post-card-header';
import AttachmentCard from '../attachments/attachment-card';
import PostComment from './post-comment';
import { useEffect, useEffectEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotificationProvider } from '@/components/notification-provider';
import { getColorsFromColorCode } from '@/lib/dashboard/utils';

type PostDetailsCardProps = {
    course: Course;
    post: Post;
    submission?: Submission;
}

export default function PostDetailsCard({ course, post, submission }: PostDetailsCardProps) {
    const { notify } = useNotificationProvider();

    const [colors, setColors] = useState<{ bg: React.CSSProperties; text: string, neutralBgText: string }>({ bg: {}, text: '', neutralBgText: '' });
    const [comments, setComments] = useState<Comment[]>(post.comments);

    useEffect(() => {
        const colorz = getColorsFromColorCode(course.color);
        setColors(colorz);
    }, [course]);

    const handleNewComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);
        const content = (fd.get('content') ?? '').toString().trim();
        if (!content) return;

        try { 
            const response = await fetch(`/api/posts/${post.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if(!response.ok) {
                notify("Hiba történt a hozzászólás létrehozásakor", {type: "error"});
                return;
            }

            switch(response.status) {
                case 201: 
                    const data = await response.json();
                    const newComment = data.comment as Comment;
                    setComments((prev) => [...prev, newComment]);
                    notify("Hozzászólás sikeresen létrehozva", {type: "success"});
                    break;
                case 400:
                    notify("A hozzászólás tartalma nem lehet üres", {type: "error"});
                    break;
                case 401:
                    notify("Nincs jogosultságod hozzászólást létrehozni ehhez a poszthoz", {type: "error"});
                    break;
                case 404:
                    notify("A poszt nem található a kurzusaid között", {type: "error"});
                    break;
                default:
                    notify("Hiba történt a hozzászólás létrehozásakor", {type: "error"});
            }

            form.reset();
        } catch (err) {
            console.error('Failed to create comment', err);
        }
    }

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
            <Card>
                <CardHeader>
                    <CardTitle className='text-lg'>Hozzászólás létrehozása</CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                    <form
                        onSubmit={handleNewComment}
                        className="flex flex-col gap-3"
                    >
                        <label className="sr-only" htmlFor="comment-content">Hozzászólás</label>
                        <textarea
                            id="comment-content"
                            name="content"
                            rows={4}
                            className="w-full rounded-md border p-3 resize-none"
                            placeholder="Írj egy hozzászólást..."
                            required
                        />
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="submit"
                                variant="default"
                                className={`px-3 py-2 rounded ${colors.text} text-sm`}
                                style={colors.bg}
                            >
                                Közzététel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            {comments.length > 0 && (
                <div className='w-full flex flex-col gap-4'>
                    {comments.map((comment) => (
                        <PostComment comment={comment} course={course} key={comment.id}/>
                    ))}
                </div>
            )}
        </div>
    )
}
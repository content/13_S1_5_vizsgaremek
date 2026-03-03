import { useNotificationProvider } from "@/components/notification-provider";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Course, Message, Post, User } from "@studify/types"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type PostMessageModalProps = {
    post: Post;
    sender: User;
    receiver: User;
    children?: React.ReactNode;

    isOpen: boolean;
    onClose: () => void;
}

export default function PostMessagesDialog({ post, sender, receiver, children, isOpen, onClose }: PostMessageModalProps) {
    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [messages, setMessages] = useState<Message[]>([]);

    const handleSendMessage = (message: string) => {
        if(!course) return;

        const response = fetch(`/api/courses/${course.id}/posts/${post.id}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                senderId: sender.id,
                receiverId: receiver.id,
                message
            })
        });

        
    }

    useEffect(() => {
        if(!session || !session.user) return;

        const course = session.user.courses.find((course: Course) => course.posts.some((p: Post) => p.id === post.id));
        if(!course) return;

        setCourse(course);

        const fetchMessages = async () => {
            const response = await fetch(`/api/courses/${course.id}/posts/${post.id}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    senderId: sender.id,
                    receiverId: receiver.id
                })
            });
        
            if(!response.ok) {
                notify("Hiba történt az üzenetek betöltésekor", { type: "error" });
            }

            switch(response.status) {
                case 200:
                    const data = await response.json();
                    setMessages(data.messages);
                    setIsLoading(false);
                    break;

                case 404:
                    notify("Nem található a kurzus vagy a poszt", { type: "error" });
                    setIsLoading(false);
                    break;
                    
                default:
                    notify("Hiba történt az üzenetek betöltésekor", { type: "error" });
                    setIsLoading(false);
            }
        };

        fetchMessages();
    }, [session, post, sender, receiver])
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }}}
        >
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Üzenetek</DialogTitle>
                </DialogHeader>
                <p>Messages here</p>
            </DialogContent>
        </Dialog> 
    )
}
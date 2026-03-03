import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getRelativeTime } from "@/lib/time/utils";
import { Dialog } from "@radix-ui/react-dialog";
import { Message, Post, User } from "@studify/types";
import { ChevronDown, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "../../avatar";
import { groupMessagesByDate } from "@/lib/utils";
import Chat from "./chat";

type PostMessageModalProps = {
    post: Post;
    sender: User;
    receiver: User;
    children?: React.ReactNode;

    isOpen: boolean;
    onClose: () => void;
}

export default function PostMessagesDialog({ post, sender, receiver, children, isOpen, onClose }: PostMessageModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const receiverFullName = `${receiver.first_name} ${receiver.last_name}`;

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
        });
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/posts/${post.id}/messages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ receiverId: receiver.id }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages || []);
                    setTimeout(() => scrollToBottom(false), 100);
                }
            } catch (error) {
                // silently fail
            }
        };

        fetchMessages();
    }, [isOpen, post, receiver.id]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen]);
    
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="flex flex-col sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[85vh]">
                <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            user={receiver}
                            size="small"
                        />
                        <div className="min-w-0">
                            <DialogTitle className="text-base font-semibold truncate">
                                {receiverFullName}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground truncate">Értékelő Tanár</p>
                        </div>
                    </div>
                </DialogHeader>

                <Chat 
                    messages={messages} 
                    sender={sender}
                    receiver={receiver}
                    post={post}
                />
            </DialogContent>
        </Dialog>
    )
}
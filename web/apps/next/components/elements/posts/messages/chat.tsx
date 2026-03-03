import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getRelativeTime } from "@/lib/time/utils";
import { Dialog } from "@radix-ui/react-dialog";
import { Message, Post, User } from "@studify/types";
import { ChevronDown, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "../../avatar";
import { groupMessagesByDate } from "@/lib/utils";

type ChatProps = {
    post: Post;
    sender: User;
    receiver: User;
    messages: Message[];
}

export default function Chat({ post, sender, receiver, messages }: ChatProps) {
    const [messagesState, setMessages] = useState<Message[]>(messages);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [showScrollDown, setShowScrollDown] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const receiverFullName = `${receiver.first_name} ${receiver.last_name}`;

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
        });
    };

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        setShowScrollDown(distanceFromBottom > 100);
    };

    const handleSendMessage = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isSending) return;

        setIsSending(true);
        setInputValue("");

        const optimisticMessage: Message = {
            id: Date.now(),
            sender,
            recipient: receiver,
            content: trimmed,
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        setTimeout(() => scrollToBottom(), 50);

        try {
            const response = await fetch(`/api/posts/${post.id}/messages/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed }),
            });

            if (!response.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            } else {
                const data = await response.json();
                if (data.message) {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === optimisticMessage.id ? data.message : m))
                    );
                }
            }
        } catch {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        const el = e.target;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div>
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-5 py-4 min-h-[300px] max-h-[50vh] relative"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Betöltés...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                            <Send className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Nincsenek üzenetek</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Küldj üzenetet a beszélgetés indításához.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {messageGroups.map((group) => (
                            <div key={group.label}>
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs font-medium text-muted-foreground px-2">
                                        {group.label}
                                    </span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                <div className="space-y-1.5">
                                    {group.messages.map((msg, idx) => {
                                        const isMine = msg.sender.id === sender.id;
                                        const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                                        const nextMsg = idx < group.messages.length - 1 ? group.messages[idx + 1] : null;
                                        const showAvatar = !nextMsg || nextMsg.sender.id !== msg.sender.id;
                                        const isFirstInGroup = !prevMsg || prevMsg.sender.id !== msg.sender.id;

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`group flex gap-2 ${isMine ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : ""}`}
                                            >
                                                <div className="flex flex-col">
                                                    <div className="flex gap-2 items-center justify-end">
                                                        {!isMine && (
                                                            <div className="w-8 shrink-0 flex items-end">
                                                                {showAvatar && (
                                                                    <UserAvatar
                                                                        user={msg.sender}
                                                                        size="small"
                                                                        className="h-8 w-8"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className={`flex flex-col max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                                                            <div
                                                                className={`px-3.5 py-2 text-sm leading-relaxed break-words ${
                                                                    isMine
                                                                        ? `bg-primary text-primary-foreground ${
                                                                            isFirstInGroup && showAvatar
                                                                                ? "rounded-2xl"
                                                                                : isFirstInGroup
                                                                                    ? "rounded-2xl rounded-br-md"
                                                                                    : showAvatar
                                                                                    ? "rounded-2xl rounded-tr-md"
                                                                                    : "rounded-2xl rounded-r-md"
                                                                        }`
                                                                        : `bg-muted text-foreground ${
                                                                            isFirstInGroup && showAvatar
                                                                                ? "rounded-2xl"
                                                                                : isFirstInGroup
                                                                                    ? "rounded-2xl rounded-bl-md"
                                                                                    : showAvatar
                                                                                    ? "rounded-2xl rounded-tl-md"
                                                                                    : "rounded-2xl rounded-l-md"
                                                                        }`
                                                                }`}
                                                            >
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {showAvatar && (
                                                        <span className={`text-[10px] text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? "text-end" : "text-start"}`}>
                                                            {getRelativeTime(msg.createdAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {showScrollDown && (
                    <button
                        type="button"
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-md hover:bg-muted transition-colors"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                        Legújabb üzenetek
                    </button>
                )}
            </div>

            <div className="shrink-0 border-t border-border px-4 py-3 bg-card">
                <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 relative mb-0 flex items-center">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder="Üzenet írása..."
                            className="w-full text-nowrap resize-none rounded-xl overflow-hidden border border-input bg-background px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                            style={{ maxHeight: 120 }}
                        />
                    </div>
                    <Button
                        type="button"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isSending}
                        className="shrink-0 h-11 w-11 rounded-xl"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span className="sr-only">Küldés</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
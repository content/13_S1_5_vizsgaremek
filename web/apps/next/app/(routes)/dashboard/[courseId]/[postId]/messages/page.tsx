"use client";

import CourseBanner from "@/components/elements/course-banner";
import { UserAvatar } from "@/components/elements/avatar";
import { useNotificationProvider } from "@/components/notification-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Course, CourseMember, Message, Post, User } from "@studify/types";
import { Home, MessagesSquare, NotebookText } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getRelativeTime } from "@/lib/time/utils";
import Chat from "@/components/elements/posts/messages/chat";
import { usePrivateMessage } from "@/hooks/use-websocket-events";

type TeacherConversation = { student: User; messages: Message[] };

function normalizeMessage(message: Message): Message {
    return {
        ...message,
        createdAt: new Date(message.createdAt),
    };
}

function groupMessagesByDate(messages: Message[]): { label: string; messages: Message[] }[] {
    const groups: Map<string, Message[]> = new Map();

    for (const msg of messages) {
        const date = new Date(msg.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

        let label: string;
        if (diffDays === 0) {
            label = "Ma";
        } else if (diffDays === 1) {
            label = "Tegnap";
        } else {
            label = date.toLocaleDateString("hu-HU", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }

        if (!groups.has(label)) {
            groups.set(label, []);
        }
        groups.get(label)!.push(msg);
    }

    return Array.from(groups.entries()).map(([label, messages]) => ({ label, messages }));
}

export default function MessagesPage({ params }: { params: Promise<{ courseId: string, postId: string }> }) {
    const { courseId, postId } = React.use(params);

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();


    const [isLoading, setIsLoading] = useState(true);

    const [course, setCourse] = useState<Course | null>(null);
    const [post, setPost] = useState<Post | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<TeacherConversation[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [isUserTeacher, setIsUserTeacher] = useState(false);

    useEffect(() => {
        if(!post || !session?.user) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/posts/${post.id}/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: isUserTeacher ? undefined : JSON.stringify({ receiverId: post.author.id }),
                });

                if(!response.ok) {
                    notify("Hiba történt az üzenetek lekérése közben", { type: "error" });
                    return;
                }

                const data = await response.json();

                if(!data.success) {
                    notify("Hiba történt az üzenetek lekérése közben", { type: "error" });
                    return;
                }

                if(isUserTeacher) {
                    const normalizedConversations: TeacherConversation[] = (data.conversations || []).map((conversation: TeacherConversation) => ({
                        ...conversation,
                        messages: (conversation.messages || []).map(normalizeMessage),
                    }));

                    setConversations(normalizedConversations);
                    setSelectedStudentId(normalizedConversations[0]?.student.id ?? null);
                    setMessages([]);
                } else {
                    setMessages((data.messages || []).map(normalizeMessage));
                    setConversations([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [post, isUserTeacher, session]);

    useEffect(() => {
        if(status === "loading") return;

        if(!session || !session.user) {
            notify("Nincs jogosultságod megtekinteni ezt az oldalt", {type: "error"});
            redirect("/dashboard");
        }

        const user = session.user as any;
        const tmpCourse = user.courses.find((c: Course) => c.id === +courseId);
        
        if(!tmpCourse) {
            notify("Nincs jogosultságod megtekinteni ezt az oldalt", {type: "error"});
            redirect("/dashboard");
        }
        
        const isTeacher = tmpCourse.members.find((m: CourseMember) => m.user.id === user.id)?.isTeacher || false;
        const tmpPost = tmpCourse.posts.find((p: Post) => p.id === +postId);

        if(!tmpPost) {
            notify("Nincs jogosultságod megtekinteni ezt az oldalt", {type: "error"});
            redirect("/dashboard");
        }

        setCourse(tmpCourse);
        setIsUserTeacher(isTeacher);
        setPost(tmpPost);
    }, [session, status]);

    usePrivateMessage((payload) => {
        setConversations((prevConversations) => {
            return prevConversations.map((conversation) => {
                if (conversation.student.id === payload.senderId || conversation.student.id === payload.recipientId) {
                    return {
                        ...conversation,
                        messages: [...conversation.messages, normalizeMessage(payload.message)],
                    };
                }
                return conversation;
            });
        });
    }, []);

    const tabs = [
        { id: "course", label: "Vissza a kurzushoz", icon: Home, href: `/dashboard/${courseId}` },
        { id: "task", label: "Vissza a feladathoz", icon: NotebookText, href: `/dashboard/${courseId}/${postId}` },
    ];

    const selectedConversation = conversations.find((conversation) => conversation.student.id === selectedStudentId) || null;
    const selectedConversationMessages = selectedConversation
        ? [...selectedConversation.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : [];

    const messageGroups = groupMessagesByDate(selectedConversationMessages);

    return (
        isLoading || !course || !post || !session || !session.user ? (
            <div>
                LOADING
            </div>
        ) : (
            <div>
                <CourseBanner course={course} />



                <div className="mt-6 mx-auto w-full max-w-6xl space-y-6">
                    <Card className="p-4 rounded-lg">
                        <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
                            {tabs.map((tab) => (
                                <Link href={tab.href} key={tab.id}>
                                    <Button 
                                        key={tab.id} 
                                        variant="ghost" 
                                        className={`flex items-center space-x-2`}
                                    >
                                        <tab.icon className={`h-5 w-5`} />
                                        <span>{tab.label}</span>
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </Card>

                    {isUserTeacher ? (
                        conversations.length === 0 ? (
                            <Card>
                                <div className="p-5 flex justify-center items-center w-full text-center text-gray-500 min-h-auto lg:min-h-[250px]">
                                    <div className="flex flex-col justify-center items-center">
                                        <div className="rounded-full bg-primary/10 flex justify-center items-center w-16 h-16 mb-4">
                                            <MessagesSquare className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground">Nincsenek beérkező üzenetek</h3>
                                        <p className="text-sm text-muted-foreground mt-2">Ehhez a feladathoz még egy tanuló sem küldött üzenetet.</p>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <Card className="p-2 lg:col-span-1">
                                    <div className="space-y-1">
                                        {conversations.map((conversation) => {
                                            const sortedMessages = [...conversation.messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                                            const latestMessage = sortedMessages[0];
                                            const isActive = selectedStudentId === conversation.student.id;

                                            return (
                                                <button
                                                    key={conversation.student.id}
                                                    type="button"
                                                    onClick={() => setSelectedStudentId(conversation.student.id)}
                                                    className={`w-full text-left rounded-md p-3 transition-colors ${isActive ? "bg-primary/10" : "hover:bg-muted"}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <UserAvatar user={conversation.student} size="small" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {conversation.student.last_name} {conversation.student.first_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">Üzenetek: {conversation.messages.length}</p>
                                                            {latestMessage ? (
                                                                <p className="text-xs text-muted-foreground truncate">{latestMessage.content}</p>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Card>

                                <Card className="p-4 lg:col-span-2">
                                    {!selectedConversation ? (
                                        <div className="h-full min-h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                                            Válassz egy tanulót a beszélgetések közül.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-full">
                                            <div className="border-b pb-3 flex items-center gap-3">
                                                <UserAvatar user={selectedConversation.student} size="medium" />
                                                <h3 className="text-base font-semibold text-foreground">
                                                    {selectedConversation.student.last_name} {selectedConversation.student.first_name}
                                                </h3>
                                            </div>

                                            <Chat
                                                key={`${selectedConversation.student.id}_CONVERSATION`} 
                                                messages={selectedConversationMessages} 
                                                sender={session.user as unknown as User}
                                                receiver={selectedConversation.student}
                                                post={post}
                                            />
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )
                    ) : messages.length === 0 ? (
                        <Card>
                            <div className="p-5 flex justify-center items-center w-full text-center text-gray-500 min-h-auto lg:min-h-[250px]">
                                <div className="flex flex-col justify-center items-center">
                                    <div className="rounded-full bg-primary/10 flex justify-center items-center w-16 h-16 mb-4">
                                        <MessagesSquare className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">Nincsenek üzenetek</h3>
                                    <p className="text-sm text-muted-foreground mt-2">Ehhez a feladathoz még nem kaptál üzeneteket.</p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        messages.map((message) => (
                            <Card key={message.id} className="p-4">
                                <p className="text-foreground">{message.content}</p>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        )
    )
}
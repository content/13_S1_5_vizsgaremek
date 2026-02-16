"use client";

import { useNotificationProvider } from "@/components/notification-provider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CalendarToggle, MonthlyView, WeeklyView } from "@/components/elements/calendar/calendar";
import PostCard from "@/components/elements/posts/post-card";
import { addDays, MONTHS } from "@/lib/utils";
import { Course, Post } from "@studify/types";
import { Calendar1, CalendarDays, ChevronLeft, Clock, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


type PostWithCourse = Post & { course: Course };

export default function CalendarPage() {
    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const router = useRouter();

    const [posts, setPosts] = useState<PostWithCourse[]>([]);
    const [postsWithDeadline, setPostsWithDeadline] = useState<PostWithCourse[]>([]);
    const [postsWithNoDeadline, setPostsWithNoDeadline] = useState<PostWithCourse[]>([]);
    const [view, setView] = useState<"week" | "month">("week");
    const [baseDate, setBaseDate] = useState<Date>(new Date());

    useEffect(() => {
        if(status === "loading") return;

        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", {type: "error"});
            router.push("/login");
            return;
        }

        const allPosts = session.user.courses.flatMap((course: Course) => course.posts.map((post: Post) => ({ ...post, course })));
        setPosts(allPosts);

        const postsWithoutDeadline = allPosts.filter((post: PostWithCourse) => !post.deadlineAt && ["ASSIGNMENT", "POLL", "QUESTION"].includes(post.postType.name));
        setPostsWithNoDeadline(postsWithoutDeadline);
        setPostsWithDeadline(allPosts.filter((post: PostWithCourse) => post.deadlineAt && ["ASSIGNMENT", "POLL", "QUESTION"].includes(post.postType.name)));
    }, [session, status, router]);

    return ( 
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold mb-0">Naptár</h1>
                    <p className="text-muted-foreground">A beadandó feladataid naptár nézetben.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => {setBaseDate(new Date())}}
                            >
                                <Clock className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent align="center" side="top">
                            <p>Ugrás a mai naphoz</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => {setView(view === "week" ? "month" : "week")}}
                            >
                                {view === "week" ? <Calendar1 className="w-4 h-4" /> : <CalendarDays className="w-4 h-4"/>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent align="center" side="top">
                            <p>Naptár nézet váltása</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Card className="w-full">
                        <CardContent className="flex justify-between items-center w-full border border-1 border-primary/10 rounded-lg px-2 py-2">
                            <div 
                                className="p-3 border border-1 border-primary/10 hover:bg-primary/10 transition ease-in-out cursor-pointer rounded-lg flex justify-center items-center"
                                onClick={() => setBaseDate(addDays(baseDate, view === "week" ? -7 : -30))}
                            >
                                <ChevronLeft />
                            </div>
                            <div className="flex flex-col items-center">
                                <h1 className="text-lg font-semibold">{baseDate.getFullYear()} {MONTHS[baseDate.getMonth()]}</h1>
                                {view === "week" && (
                                    <p className="text-xs text-muted-foreground">
                                        {baseDate.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }).charAt(0).toUpperCase() + baseDate.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }).slice(1)} - {addDays(baseDate, 6).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }).charAt(0).toUpperCase() + addDays(baseDate, 6).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }).slice(1)}
                                    </p>
                                )}
                            </div>
                            <div 
                                className="p-3 border border-1 border-primary/10 hover:bg-primary/10 transition ease-in-out cursor-pointer rounded-lg flex justify-center items-center"
                                onClick={() => setBaseDate(addDays(baseDate, view === "week" ? 7 : 30))}
                            >
                                <ChevronLeft className="rotate-180" />
                            </div>
                        </CardContent>
                    </Card>
                    {/* <div className="flex items-center gap-2">
                        <button
                            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                            onClick={() => setBaseDate(new Date())}
                        >
                            Ma
                        </button>
                        <CalendarToggle view={view} onChange={setView} />
                    </div> */}
                </div>

                {view === "week" ? (
                    <WeeklyView baseDate={baseDate} posts={postsWithDeadline} />
                ) : (
                    <MonthlyView baseDate={baseDate} posts={postsWithDeadline} />
                )}
            </div>
            <div className="">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold mb-0">Egyéb feladatok</h1>
                    <p className="text-sm text-muted-foreground">Ezek a feladatok beadhatóak, azonban nincs határidő megadva.</p>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    {postsWithNoDeadline.map((post: PostWithCourse) => (
                        <PostCard key={post.id} course={post.course} post={post} showCourseName={true} />
                    ))}
                </div>
            </div>
        </div>
    )
}
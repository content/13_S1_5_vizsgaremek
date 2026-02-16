import { useMemo } from "react";
import { Post, Course } from "@studify/types";
import { addDays, formatTime, isSameDay, MONTHS, startOfWeekMonday, toDateKey, WEEKDAYS } from "@/lib/utils";

type PostWithCourse = Post & { course: Course };

type CalendarToggleProps = {
    view: "week" | "month";
    onChange: (view: "week" | "month") => void;
}

export function CalendarToggle({ view, onChange }: CalendarToggleProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                className={`rounded-md px-3 py-2 text-sm font-medium border ${
                    view === "week"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted"
                }`}
                onClick={() => onChange("week")}
            >
                Heti nézet
            </button>
            <button
                className={`rounded-md px-3 py-2 text-sm font-medium border ${
                    view === "month"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted"
                }`}
                onClick={() => onChange("month")}
            >
                Havi nézet
            </button>
        </div>
    );
}

type WeeklyViewProps = {
    baseDate: Date;
    posts: PostWithCourse[];
}

export function WeeklyView({ baseDate, posts }: WeeklyViewProps) {
    const weekStart = startOfWeekMonday(baseDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = new Date();

    const byDate = useMemo(() => {
        const map = new Map<string, PostWithCourse[]>();
        posts.forEach(p => {
            if (!p.deadlineAt) return;
            const key = toDateKey(new Date(p.deadlineAt));
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        });

        map.forEach(list => list.sort((a, b) => +new Date(a.deadlineAt!) - +new Date(b.deadlineAt!)));
        return map;
    }, [posts]);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                {days.map((d) => {
                    const key = toDateKey(d);
                    const dayPosts = byDate.get(key) ?? [];
                    return (
                        <div
                            key={key}
                            className={`rounded-lg border p-3 min-h-[120px] ${
                                isSameDay(d, today) ? "border-primary" : "border-border"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-semibold">
                                    {d.toLocaleDateString("hu-HU", { weekday: "short" })}
                                </div>
                                <div className="text-sm font-semibold text-muted-foreground">
                                    {d.getDate()}.
                                </div>
                            </div>
                            <div className="space-y-2">
                                {dayPosts.map((p) => (
                                    <div key={p.id} className="rounded-md bg-muted px-2 py-1">
                                        <div className="text-xs text-muted-foreground">
                                            {formatTime(new Date(p.deadlineAt!))}
                                        </div>
                                        <div className="text-sm font-medium">{p.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {p.course.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export function MonthDayComponent({ date, baseDate, posts }: { date: Date; baseDate: Date; posts: PostWithCourse[] }) {
    const today = new Date();
    const isCurrentMonth = date.getMonth() === baseDate.getMonth();
    const dayPosts = posts;
    
    return (
    <div
        className={`rounded-lg border p-2 min-h-[110px] ${
            isSameDay(date, today) ? "border-primary" : "border-border"
        } ${isCurrentMonth ? "bg-background" : "bg-muted/50"}`}
    >
        <div className="text-xs font-semibold mb-2">
            {date.getDate()}
        </div>
        <div className="space-y-1">
            {dayPosts.slice(0, 3).map((p: any) => (
                <div key={p.id} className="rounded bg-muted px-1.5 py-1">
                    <div className="text-[10px] text-muted-foreground">
                        {formatTime(new Date(p.deadlineAt!))}
                    </div>
                    <div className="text-xs font-medium line-clamp-1">
                        {p.name}
                    </div>
                </div>
            ))}
            {dayPosts.length > 3 && (
                <div className="text-[10px] text-muted-foreground">
                    +{dayPosts.length - 3} további
                </div>
            )}
        </div>
    </div>
    );
}

type MonthlyViewProps = {
    baseDate: Date;
    posts: PostWithCourse[];
}

export function MonthlyView({ baseDate, posts }: MonthlyViewProps) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const start = startOfWeekMonday(firstDay);

    // Calculate last visible Sunday (based on Monday-start weeks)
    const lastDayWeekIndex = (lastDay.getDay() + 6) % 7; // Monday=0 ... Sunday=6
    const end = addDays(lastDay, 6 - lastDayWeekIndex);

    const totalDays =
        Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

    const days = Array.from({ length: totalDays }, (_, i) => addDays(start, i));
    const today = new Date();

    const byDate = useMemo(() => {
        const map = new Map<string, PostWithCourse[]>();
        posts.forEach(p => {
            if (!p.deadlineAt) return;
            const key = toDateKey(new Date(p.deadlineAt));
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        });
        map.forEach(list => list.sort((a, b) => +new Date(a.deadlineAt!) - +new Date(b.deadlineAt!)));
        return map;
    }, [posts]);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
                {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map((d, idx) => {
                    const key = toDateKey(d);
                    const dayPosts = byDate.get(key) ?? [];
                    const isCurrentMonth = d.getMonth() === month;
                    return (
                        <MonthDayComponent key={`${key}-${idx}`} date={d} baseDate={baseDate} posts={dayPosts} />
                    )
                })}
            </div>
        </div>
    );
}
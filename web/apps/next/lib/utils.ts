import { Message } from "@studify/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const WEEKDAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
export const MONTHS = [
    "Január","Február","Március","Április","Május","Június",
    "Július","Augusztus","Szeptember","Október","November","December"
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toDateKey(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function startOfWeekMonday(d: Date) {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const start = new Date(d);
    start.setDate(d.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
}

export function addDays(d: Date, days: number) {
    const res = new Date(d);
    res.setDate(d.getDate() + days);
    return res;
}

export function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

export function formatTime(d: Date) {
    return d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
}

export function groupMessagesByDate(messages: Message[]): { label: string; messages: Message[] }[] {
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
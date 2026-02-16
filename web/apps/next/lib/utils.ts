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
"use client";

import { isToday, startOfDay } from "date-fns";
import { hu } from "date-fns/locale";
import React, { useEffect, useMemo } from "react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type DateSelectorProps = {
    defaultDate?: Date;
    children?: React.ReactNode;
    onDateChange?: (date: Date | undefined) => void;
    disablePast?: boolean;
    disabled?: boolean;
    className?: string;
};

export default function DateSelector({
    defaultDate,
    children,
    onDateChange,
    className,
    disabled = false,
    disablePast = false,
}: DateSelectorProps) {
    const [date, setDate] = React.useState<Date | undefined>(defaultDate);
    const [hour, setHour] = React.useState<string>(
        defaultDate ? String(defaultDate.getHours() === 0 ? 24 : defaultDate.getHours()).padStart(2, "0") : "12"
    );
    const [minute, setMinute] = React.useState<string>(
        defaultDate ? String(defaultDate.getMinutes()).padStart(2, "0") : "00"
    );

    const combinedDateTime = useMemo(() => {
        if (!date) return undefined;
        const combined = new Date(date);
        const hourNum = parseInt(hour, 10);
        const actualHour = hourNum === 24 ? 0 : hourNum;
        combined.setHours(actualHour, parseInt(minute, 10), 0, 0);
        return combined;
    }, [date, hour, minute]);

    useEffect(() => {
        if (onDateChange) {
            onDateChange(combinedDateTime);
        }
    }, [combinedDateTime, onDateChange]);

    const hourOptions = useMemo(() => {
        const hours: string[] = [];
        for (let i = 1; i <= 24; i++) {
            hours.push(String(i).padStart(2, "0"));
        }
        return hours;
    }, []);

    const minuteOptions = useMemo(() => {
        const minutes: string[] = [];
        for (let i = 0; i < 60; i++) {
            minutes.push(String(i).padStart(2, "0"));
        }
        return minutes;
    }, []);

    const isHourDisabled = (hourStr: string): boolean => {
        if (!disablePast || !date || !isToday(date)) return false;
        const hourNum = parseInt(hourStr, 10);
        const actualHour = hourNum === 24 ? 0 : hourNum;
        return actualHour < new Date().getHours();
    };

    const isMinuteDisabled = (minuteStr: string): boolean => {
        if (!disablePast || !date || !isToday(date)) return false;
        const now = new Date();
        const selectedHour = parseInt(hour, 10);
        const actualHour = selectedHour === 24 ? 0 : selectedHour;
        const minuteNum = parseInt(minuteStr, 10);
        
        if (actualHour < now.getHours()) return true;
        if (actualHour === now.getHours() && minuteNum < now.getMinutes()) return true;
        return false;
    };

    const disabledDays = disablePast
        ? { before: startOfDay(new Date()) }
        : undefined;

    const handleDateChange = (selectedDate: Date) => {
        setDate(selectedDate);
        
        if(!disablePast || !isToday(selectedDate)) return;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const selectedHour = parseInt(hour, 10);
        const actualHour = selectedHour === 24 ? 0 : selectedHour;
        
        if (actualHour < currentHour) {
            setHour(String(currentHour).padStart(2, "0"));
            setMinute(String(currentMinute).padStart(2, "0"));
        } else if (actualHour === currentHour && parseInt(minute, 10) < currentMinute) {
            setMinute(String(currentMinute).padStart(2, "0"));
        }
    };

    return (
        <div className={`flex gap-2 items-center ${className}`}>
            <Popover>
                <PopoverTrigger asChild>{children}</PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => selectedDate && handleDateChange(selectedDate)}
                        locale={hu}
                        disabled={disabledDays}
                    />
                </PopoverContent>
            </Popover>
            <div className="flex gap-1 items-center">
                <Select value={hour} onValueChange={setHour} disabled={disabled}>
                    <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="Óra" />
                    </SelectTrigger>
                    <SelectContent>
                        {hourOptions.map((h) => (
                            <SelectItem 
                                key={h} 
                                value={h} 
                                disabled={isHourDisabled(h)}
                            >
                                {h}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-muted-foreground">:</span>
                <Select value={minute} onValueChange={setMinute} disabled={disabled}>
                    <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="Perc" />
                    </SelectTrigger>
                    <SelectContent>
                        {minuteOptions.map((m) => (
                            <SelectItem 
                                key={m} 
                                value={m}
                                disabled={isMinuteDisabled(m)}
                            >
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
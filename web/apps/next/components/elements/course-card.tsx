"use client"

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getColorsFromColorCode } from "@/lib/dashboard/utils";
import { Course } from "@studify/types";
import { MoreVertical } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useNotificationProvider } from "../notification-provider";
import React, { useEffect } from "react";

export default function CourseCard({course}: {course: Course}) {
    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();
    
    const colors = getColorsFromColorCode(course.color);
    
    const teachers = course.members.filter((member: any) => member.isTeacher);
    const theacherNames = teachers.map((teacher: any) => `${teacher.user.first_name} ${teacher.user.last_name}`);

    const [isTeacher, setIsTeacher] = React.useState(false);

    useEffect(() => {
        if(status === "loading" || !session || !session.user) return;

        const userId = session.user.id;
        const isUserTeacher = course.members.some((member: any) => member.user.id === userId && member.isTeacher);

        setIsTeacher(isUserTeacher);
    }, [session, status]);

    const copyInvitationCodeToClipboard = () => {
        navigator.clipboard.writeText(course.invitationCode)
            .then(() => {
                notify("Meghívó kód másolva a vágólapra!", { type: "success" });
            })
            .catch(() => {
                notify("Hiba történt a meghívó kód másolása során!", { type: "error" });
            });
    }

    const handleLeaveCourse = async () => {
        try {
            const response = await fetch(`/api/courses/${course.id}/leave`, {
                method: "POST",
            });
            
            if (response.ok) {
                notify("Sikeresen elhagytad a kurzust!", { type: "success" });
                return;
            }

            const result = await response.json();
            notify("Szerver hiba", { type: "error", description: result.error || "Hiba történt a kurzus elhagyása során!" });
        } catch (error) {
            notify("Hálózati hiba", { type: "error", description: "Nem sikerült csatlakozni a szerverhez. Kérlek próbáld újra később!" });
        }
    }

    return (
        <Link href={`/dashboard/${course.id}`}>
            <div className="group relative bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 z-1 cursor-pointer">
                <div className="relative h-28 p-4">
                    <div className="absolute top-0 bottom-0 left-0 right-0 z-1">
                        {course.backgroundImage ? (
                            <Image src={course.backgroundImage.path} alt={`${course.name} background`} fill className="object-cover z-1" />
                        ) : (
                            <div className="absolute inset-0 z-1" style={colors.bg}></div>
                        )}
                    </div>
                    <div className="absolute z-1 flex justify-between items-start h-full">
                        <div className="flex flex-col justify-between h-full flex-1 min-w-0 pr-4">
                            <div>
                                <div className="block">
                                    <h3 className="text-lg font-semibold text-white truncate">{course.name}</h3>
                                </div>
                                <p className="text-sm text-white/80 truncate mt-0.5">{theacherNames.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border px-4 py-2.5 flex items-center justify-end gap-1 bg-muted/30">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" asChild>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">További lehetőségek</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/dashboard/${course.id}`}>Kurzus megnyitása</Link>
                            </DropdownMenuItem>
                            {course.invitationCode && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => copyInvitationCodeToClipboard()}>
                                    Meghívó másolása
                                </DropdownMenuItem>
                            )}
                            
                            {!isTeacher && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-500 hover:text-red-600 cursor-pointer" onClick={() => handleLeaveCourse()}>
                                        Kurzus elhagyása
                                    </DropdownMenuItem>
                                </>  
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </Link>
        
    )
}
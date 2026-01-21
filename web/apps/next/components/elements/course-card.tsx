"use client"

import { Course } from "@studify/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, ClipboardList, FolderOpen, Users } from "lucide-react"

function generateColorFromInvitationCode(code: string): { bg: string; text: string } {
    const colors = [
        { bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500', text: 'text-white' },
        { bg: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500', text: 'text-white' },
        { bg: 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500', text: 'text-white' },
        { bg: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400', text: 'text-black' },
        { bg: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500', text: 'text-white' },
        { bg: 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500', text: 'text-white' },
    ]

    let hash = 0

    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export default function CourseCard({course}: {course: Course}) {
    console.log(course)

    const colors = generateColorFromInvitationCode(course.invitationCode);
    
    const teachers = course.members.filter((member: any) => member.isTeacher);
    const theacherNames = teachers.map((teacher: any) => `${teacher.user.first_name} ${teacher.user.last_name}`);

    return (
        <div className="group relative bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 z-1 cursor-pointer">
            <div className="relative h-28 p-4">
                <div className="absolute top-0 bottom-0 left-0 right-0 z-1">
                    {course.backgroundImage ? (
                        <>
                            {/* <div className="w-full h-full bg-black opacity-15 z-50"/> */}
                            <Image src={course.backgroundImage.path} alt={`${course.name} background`} fill className="object-cover z-1" />
                        </>
                    ) : (
                        <div className={`absolute inset-0 ${colors.bg} z-1`}></div>
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

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-2 overflow-hidden">
                    <div className="bg-white/20">
                        <DropdownMenu >
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={`/courses/${course.id}`}>Kurzus megnyitása</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">Meghívó másolása</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 hover:text-red-700 cursor-pointer">
                                    Kurzus elhagyása
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="border-t border-border px-4 py-2.5 flex items-center justify-end gap-1 bg-muted/30">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" asChild>
                    <Link href={`/courses/${course.id}/assignments`}>
                        <ClipboardList className="h-4 w-4" />
                        <span className="sr-only">Feladatok</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}
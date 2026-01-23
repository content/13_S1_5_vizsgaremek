"use client";

import { Course, CourseMember } from "@studify/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { format } from "date-fns"

import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ClipboardList, Home, Info, Pencil, Users } from "lucide-react";

import { UserAvatar } from "@/components/elements/avatar";
import NoPostsCard from "@/components/elements/posts/no-posts-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { generateColorFromInvitationCode } from "@/lib/dashboard/utils";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = React.use(params);

    const router = useRouter()

    const { data: session, status } = useSession();

    const [activeTab, setActiveTab] = useState<string>("stream");
    
    const [isUserTeacher, setIsUserTeacher] = useState<boolean>(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [teachers, setTeachers] = useState<CourseMember[]>([]);
    const [students, setStudents] = useState<CourseMember[]>([]);
    const [unverfiedStudents, setUnverifiedStudents] = useState<CourseMember[]>([]);
    
    const [teacherNames, setTeacherNames] = useState<string[]>([]);
    const [colors, setColors] = useState<{ bg: string; text: string, neutralBgText: string }>({ bg: '', text: '', neutralBgText: '' });

    const [newPostModalOpen, setNewPostModalOpen] = useState<boolean>(false);
    const [postTypes, setPostTypes] = useState<string[]>([]);
    const [selectedPostType, setSelectedPostType] = useState<string>("ANNOUNCEMENT");
    
    const [isDeadlineEnabled, setIsDeadlineEnabled] = useState<boolean>(false);
    const [date, setDate] = React.useState<Date>()

    const postTypeMappings: { [key: string]: string } = {
        "ANNOUNCEMENT": "Közlemény",
        "ASSIGNMENT": "Feladat",
        "QUESTION": "Kérdés",
        "RESOURCE": "Tananyag"
    };

    useEffect(() => {
        const fetchPostTypes = async () => {
            try {
                const response = await fetch('/api/posts');
                const data = await response.json();
                setPostTypes(data.postTypes);
            } catch (error) {
                console.error('Error fetching post types:', error);
            }
        };

        fetchPostTypes();
    }, [])

    useEffect(() => {
        if(status === "loading") return;

        if(!session || !session.user) {
            router.push("/login")
            return;
        }

        const tmpCourse = session.user.courses.find((c: Course) => c.id === +courseId)

        if(!tmpCourse) {
            router.push("/dashboard");
            return;
        }

        const teachers = tmpCourse.members.filter((member: any) => member.isTeacher);
        const students = tmpCourse.members.filter((member: any) => !member.isTeacher && member.isApproved);
        const unverifiedStudents = tmpCourse.members.filter((member: any) => !member.isTeacher && !member.isApproved);

        setCourse(tmpCourse);
        setTeachers(teachers);
        setStudents(students);
        setUnverifiedStudents(unverifiedStudents);

        const userMember = tmpCourse.members.find((member: any) => member.user.id === session.user?.id);
        setIsUserTeacher(userMember ? userMember.isTeacher : false);

        setTeacherNames(teachers.map((teacher: any) => `${teacher.user.first_name} ${teacher.user.last_name}`));
        setColors(generateColorFromInvitationCode(tmpCourse.invitationCode));
    }, [session, status, courseId, router]);

    const tabs = [
        { id: "stream", label: "Hírfolyam", icon: Home },
        { id: "assignments", label: "Feladatok", icon: ClipboardList },
        { id: "members", label: "Résztvevők", icon: Users },
    ]

    return !course ? (
        <div className="flex flex-col gap-2">
            <Skeleton className="h-48 md:h-64 lg:h-64 2xl:h-64 mb-6 rounded-lg" />
            <div>
                <Skeleton className="h-16 w-full max-w-6xl mx-auto mb-6 rounded-lg" />
                <div className="mt-6 mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_4fr] gap-6">
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-32 w-full rounded-lg mb-4" />
                        <Skeleton className="h-16 w-full rounded-lg mb-4" />
                    </div>
                    <Skeleton className="h-96 w-full rounded-lg mb-4" />
                </div>
            </div>
        </div>
    ) : (
        <div>
            <div className="relative h-48 md:h-64 lg:h-64 2xl:h-64 mb-6 shadow-md rounded-lg overflow-hidden">
                {course.backgroundImage ? (
                    <Image src={course.backgroundImage.path} alt={`${course.name} background`} fill className="absolute object-cover z-1" />
                ) : (
                    <div className={`${colors.bg} absolute overflow-hidden rounded-lg w-full h-full z-1`} />
                )}
                <div className="relative max-w-6xl mx-auto z-10 p-6 md:py-8 ">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 max-w-2xl">{course?.name}</h1>
                    <p className="text-white/90 text-sm md:text-base">{teacherNames.join(", ")}</p>
                </div>
            </div>

            <div className="mt-6 mx-auto w-full max-w-6xl space-y-6">
                <Card className="p-4 rounded-lg">
                    <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
                        {tabs.map((tab) => (
                            <Button 
                                key={tab.id} 
                                variant="ghost" 
                                className={`${activeTab === tab.id ? `bg-primary/10` : ""} flex items-center space-x-2`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? colors.neutralBgText : ""}`} />
                                <span className={activeTab === tab.id ? colors.neutralBgText : ""}>{tab.label}</span>
                            </Button>
                        ))}
                    </div>
                </Card>
                {activeTab === "stream" && (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_4fr] gap-6">
                        <div className="flex flex-col gap-4">
                            <Card>
                                <div className="p-4" />
                            </Card>
                            <Card>
                                <div className="p-4">
                                    <p>Kurzus kód:</p>
                                    <h2 className="font-mono font-bold text-lg select-all">{course.invitationCode}</h2>
                                </div>
                            </Card>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2 bg-transparent">
                                        <Pencil className="h-4 w-4" />
                                        Új poszt
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Új poszt létrehozása
                                        </DialogTitle>
                                        <DialogDescription>
                                            Hozz létre egy új posztot a kurzusod számára.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form action="">
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <label htmlFor="post-name" className="text-sm font-medium leading-none">
                                                    Poszt címe
                                                </label>
                                                <input
                                                    type="text"
                                                    id="post-name"
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="Írd be a poszt címét..."
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label htmlFor="post-type" className="text-sm font-medium leading-none">
                                                    Poszt típusa
                                                </label>
                                                <select
                                                    id="post-type"
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={selectedPostType}
                                                    onChange={(e) => setSelectedPostType(e.target.value)}
                                                >
                                                    {postTypes.map((type) => (
                                                        <option key={type} value={type}>
                                                            {postTypeMappings[type] || type}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedPostType === "ASSIGNMENT" && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Feladat posztok
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <label htmlFor="post-content" className="text-sm font-medium leading-none">
                                                    Poszt tartalma
                                                </label>
                                                <textarea
                                                    id="post-content"
                                                    className="resize-none w-full rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                                    rows={5}
                                                    placeholder="Írd be a poszt tartalmát..."
                                                />
                                            </div>
                                            {selectedPostType === "ASSIGNMENT" && (
                                                <div className="grid gap-2">
                                                    <label htmlFor="post-deadline" className="text-sm font-medium leading-none">Határidő</label>
                                                    <div className="flex gap-2 items-center">
                                                        <Checkbox className="w-7 h-7" onClick={() => setIsDeadlineEnabled(!isDeadlineEnabled)}></Checkbox>
                                                        <Popover>
                                                            <PopoverTrigger asChild className="w-full">
                                                                <Button
                                                                    disabled={!isDeadlineEnabled}
                                                                    variant="outline"
                                                                    data-empty={!date}
                                                                    className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal h-8"
                                                                >
                                                                    {date ? format(date, "PPP") : <span>Válassz egy dátumot</span>}
                                                                    <ChevronDownIcon />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={date}
                                                                    onSelect={setDate}
                                                                    defaultMonth={date}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full">
                                            Poszt közzététele
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div>
                            
                            {course.posts.length === 0 ? (
                                <NoPostsCard />
                            ) : (
                                <div className="space-y-4">
                                    {/* {course.posts.map((post: any) => (
                                        
                                    ))} */}
                                </div>
                            )}
                        </div>
                        
                    </div>
                )}
                {activeTab === "assignments" && (
                    <div>
                        { course.posts.length === 0 ? (
                            <NoPostsCard />
                        ) : (
                            <div></div>
                        )}
                    </div>
                )}
                {activeTab === "members" && (
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 p-6">
                                <div className={`flex justify-center items-center p-3 ${colors.bg} rounded-full`}>
                                    <Users className="h-6 w-6 text-white m-0" />
                                </div>
                                <h1 className="text-lg font-semibold">Tanárok</h1>
                            </CardHeader>
                            <CardContent>
                                {teachers.map((teacher: CourseMember, index: number) => (
                                    <div key={`teacher-${teacher.id}-${index}`} className="flex items-center space-x-4 mb-4 bg-card-foreground/10 p-2 rounded-lg">
                                        <UserAvatar user={teacher.user} size="large"/>
                                        <h1>{teacher.user.first_name} {teacher.user.last_name}</h1>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        {students.length > 0 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 p-6">
                                <div className={`flex justify-center items-center p-3 ${colors.bg} rounded-full`}>
                                    <Users className="h-6 w-6 text-white m-0" />
                                </div>
                                <h1 className="text-lg font-semibold">Tanulók</h1>
                            </CardHeader>
                            <CardContent>
                                {students.map((student: CourseMember, index: number) => (
                                    <div key={`student-${student.id}-${index}`} className="flex items-center space-x-4 mb-4 bg-card-foreground/10 p-2 rounded-lg">
                                        <UserAvatar user={student.user} size="large" />
                                        <h1>{student.user.first_name} {student.user.last_name}</h1>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        )}
                        {unverfiedStudents.length > 0 && isUserTeacher && (
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 p-6">
                                <div className={`flex justify-center items-center p-3 ${colors.bg} rounded-full`}>
                                    <Info className="h-6 w-6 text-white m-0" />
                                </div>
                                <h1 className="text-lg font-semibold">Jóváhagyásra váró tanulók</h1>
                            </CardHeader>
                            <CardContent>
                                {unverfiedStudents.map((student: CourseMember, index: number) => (
                                    <div key={`unverified-student-${student.id}-${index}`} className="flex items-center justify-between space-x-4 mb-4 bg-card-foreground/10 p-2 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <UserAvatar user={student.user} size="large" />
                                            <h1>{student.user.first_name} {student.user.last_name}</h1>
                                        </div>
                                        <div>
                                            <Button className="mr-2">Jóváhagyás</Button>
                                            <Button variant="destructive">Elutasítás</Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
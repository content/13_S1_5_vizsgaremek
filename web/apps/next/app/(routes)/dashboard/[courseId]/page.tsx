"use client";

import { Course, CourseMember } from "@studify/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ClipboardList, Home, Info, Users, UsersIcon } from "lucide-react";

import { UserAvatar } from "@/components/elements/avatar";
import NoPostsCard from "@/components/elements/posts/no-posts-card";
import NewPostDialog from "@/components/elements/posts/post-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { generateColorFromInvitationCode } from "@/lib/dashboard/utils";

import CourseBanner from "@/components/elements/course-banner";
import PostCard from "@/components/elements/posts/post-card";

import { Post, Submission } from "@studify/database";
import { useNotificationProvider } from "@/components/notification-provider";

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = React.use(params);

    const router = useRouter()

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [activeTab, setActiveTab] = useState<string>("stream");
    
    const [isUserTeacher, setIsUserTeacher] = useState<boolean>(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [teachers, setTeachers] = useState<CourseMember[]>([]);
    const [students, setStudents] = useState<CourseMember[]>([]);
    const [unverfiedStudents, setUnverifiedStudents] = useState<CourseMember[]>([]);
    
    const [teacherNames, setTeacherNames] = useState<string[]>([]);
    const [colors, setColors] = useState<{ bg: string; text: string, neutralBgText: string }>({ bg: '', text: '', neutralBgText: '' });

    const handleDeclineStudent = async (studentId: number) => {
        const response = await fetch(`/api/courses/${courseId}/members/decline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initiatorId: session?.user?.id,
                targetId: studentId,
            }),
        });

        switch (response.status) {
            case 200:
                notify("Sikeres elutasítás", { type: "success", description: "A tanuló jelentkezése sikeresen elutasítva." });
                setUnverifiedStudents((prev) => prev.filter((member) => member.user.id !== studentId));
                break;
            case 401:
                notify("Sikertelen elutasítás", { type: "error", description: "Nincs jogosultságod a művelet végrehajtásához." });
                break;
            case 500:
                notify("Sikertelen elutasítás", { type: "error", description: "Hiba történt a tanuló jelentkezésének elutasítása során." });
                break;
            default:
                notify("Sikertelen elutasítás", { type: "error", description: "Ismeretlen hiba történt." });
        }
    }

    const handleApproveStudent = async (studentId: number) => {
        const response = await fetch(`/api/courses/${courseId}/members/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initiatorId: session?.user?.id,
                targetId: studentId,
            }),
        });

        switch (response.status) {
            case 200:
                notify("Sikeres jóváhagyás", { type: "success", description: "A tanuló sikeresen jóváhagyva." });

                setCourse((prevCourse: Course) => {
                    if (!prevCourse) return prevCourse;
                    const updatedMembers = prevCourse.members.map((member: CourseMember) => {
                        if (member.user.id === studentId) {
                            return { ...member, isApproved: true };
                        }
                        return member;
                    });
                    return { ...prevCourse, members: updatedMembers };
                });

                setStudents((prev) => {
                    const approvedStudent = unverfiedStudents.find((member) => member.user.id === studentId);
                    if (approvedStudent) {
                        return [...prev, { ...approvedStudent, isApproved: true }];
                    }
                    return prev;
                });
                
                setUnverifiedStudents((prev) => prev.filter((member) => member.user.id !== studentId));
                break;
            case 401:
                notify("Sikertelen jóváhagyás", { type: "error", description: "Nincs jogosultságod a művelet végrehajtásához." });
                break;
            case 500:
                notify("Sikertelen jóváhagyás", { type: "error", description: "Hiba történt a tanuló jóváhagyása során." });
                break;
            default:
                notify("Sikertelen jóváhagyás", { type: "error", description: "Ismeretlen hiba történt." });
        }
                
    }

    useEffect(() => {
        if(!session || !session.user || !course) return;

        // Overwrite the session course data with the new data
        const updatedCourses = session.user.courses.map((c: Course) => {
            if(c.id === course.id) {
                return course;
            }
            return c;
        });

        session.user.courses = updatedCourses;
    }, [course]);

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
            <CourseBanner course={course} />

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
                                <div className="p-4">
                                    <p>Kurzus kód:</p>
                                    <h2 className="font-mono font-bold text-lg select-all">{course.invitationCode}</h2>
                                </div>
                            </Card>
                            {isUserTeacher && (
                                <NewPostDialog courseId={course.id} onNewPostCreated={(post: Post) => {
                                    setCourse((prevCourse: Course | null) => {
                                        if (!prevCourse) return prevCourse;

                                        console.log(post);
                                        

                                        return {
                                            ...prevCourse,
                                            posts: [post, ...prevCourse.posts],
                                        };
                                    });
                                }}/>
                            )}
                        </div>
                        <div>
                            {course.posts.length === 0 ? (
                                <NoPostsCard />
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {course.posts.map((post: any) => (
                                        <PostCard key={post.id} course={course} post={post} submission={post.submissions?.find((s: Submission) => s.student.id === session?.user?.id) || null} />
                                    ))}
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
                            <div className="flex flex-col gap-4">
                                {course.posts.map((post: any) => (
                                    <PostCard key={post.id} course={course} post={post} submission={post.submissions.find((s: Submission) => s.student.id === session?.user?.id) || null} />
                                ))}
                            </div>
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
                                            <Button className="mr-2" onClick={(e) => handleApproveStudent(student.user.id)}>Jóváhagyás</Button>
                                            <Button variant="destructive" onClick={(e) => handleDeclineStudent(student.user.id)}>Elutasítás</Button>
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
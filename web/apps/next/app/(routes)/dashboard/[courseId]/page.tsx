"use client";

import { Course, CourseMember, CourseSettings, PostType } from "@studify/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ClipboardList, Eye, Home, Info, NotebookPen, Palette, PenLine, Shield, Users } from "lucide-react";

import { UserAvatar } from "@/components/elements/avatar";
import NoPostsCard from "@/components/elements/posts/no-posts-card";
import NewPostDialog from "@/components/elements/posts/post-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { getColorsFromColorCode } from "@/lib/dashboard/utils";

import CourseBanner from "@/components/elements/course-banner";
import PostCard from "@/components/elements/posts/post-card";

import BannerUploadButton from "@/components/elements/attachments/banner-upload-button";
import { useNotificationProvider } from "@/components/notification-provider";
import {
    useCourseDeleted,
    useCourseMemberApproved,
    useCourseMemberDeclined,
    useCourseMemberJoin,
    useCourseMemberLeave,
    useNewPost,
} from "@/hooks/use-websocket-events";
import { Post, Submission } from "@studify/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import postTypeMappings from "@/lib/dashboard/postTypeMappings";
import { pt } from "date-fns/locale";

type CourseSettingsForm = {
    name: string;

    description: string;
    bannerUrl: string | File;
    accentColor: string;

    allowComments: boolean;

    showInviteCode: boolean;

    studentsCanCreatePosts: boolean;
    allowedStudentPostTypes: number[];

    autoApproveMembers: boolean;
    autoRejectMembers: boolean;
};

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = React.use(params);

    const router = useRouter()

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [activeTab, setActiveTab] = useState<string>("stream");
    const [activeSettingsTab, setActiveSettingsTab] = useState<string>("visual");

    const [isUserTeacher, setIsUserTeacher] = useState<boolean>(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [teachers, setTeachers] = useState<CourseMember[]>([]);
    const [students, setStudents] = useState<CourseMember[]>([]);
    const [unverifiedStudents, setUnverifiedStudents] = useState<CourseMember[]>([]);
    const [postTypes, setPostTypes] = useState<{ id: number; name: string }[]>([]);

    const [teacherNames, setTeacherNames] = useState<string[]>([]);
    const [color, setColor] = useState<string>("#FFFFFF");
    const [colors, setColors] = useState<{ bg: React.CSSProperties; text: string, neutralBgText: string }>({ bg: {}, text: '', neutralBgText: '' });
    
    const [settings, setSettings] = useState<CourseSettings | null>(null);
    const [settingsForm, setSettingsForm] = useState<CourseSettingsForm>({
        name: "",
        description: "",
        bannerUrl: "",
        accentColor: color,
        allowComments: true,
        showInviteCode: true,
        studentsCanCreatePosts: false,
        allowedStudentPostTypes: [],
        autoApproveMembers: false,
        autoRejectMembers: false,
    });

    const regroupMembers = (members: CourseMember[]) => {
        const nextTeachers = members.filter((member) => member.isTeacher);
        const nextStudents = members.filter((member) => !member.isTeacher && member.isApproved);
        const nextUnverifiedStudents = members.filter((member) => !member.isTeacher && !member.isApproved);

        setTeachers(nextTeachers);
        setStudents(nextStudents);
        setUnverifiedStudents(nextUnverifiedStudents);
        setTeacherNames(nextTeachers.map((teacher) => `${teacher.user.first_name} ${teacher.user.last_name}`));
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
    }, []);

    useCourseMemberJoin((payload) => {
        if (!course || payload?.course?.id !== course.id || !payload?.member) return;

        setCourse((prevCourse) => {
            if (!prevCourse) return prevCourse;
            if (prevCourse.members.some((member) => member.user.id === payload.member.user.id)) return prevCourse;

            const updatedMembers = [...prevCourse.members, payload.member];
            regroupMembers(updatedMembers);
            return { ...prevCourse, members: updatedMembers };
        });
    }, [course?.id]);

    useCourseMemberLeave((payload) => {
        if (!course || payload.courseId !== course.id) return;

        setCourse((prevCourse) => {
            if (!prevCourse) return prevCourse;

            const updatedMembers = prevCourse.members.filter((member) => member.user.id !== payload.userId);
            regroupMembers(updatedMembers);
            return { ...prevCourse, members: updatedMembers };
        });
    }, [course?.id]);

    useCourseMemberApproved((payload) => {
        if (!course || payload.courseId !== course.id) return;

        setCourse((prevCourse) => {
            if (!prevCourse) return prevCourse;

            const updatedMembers = prevCourse.members.map((member) =>
                member.user.id === payload.userId ? { ...member, isApproved: true } : member
            );

            regroupMembers(updatedMembers);
            return { ...prevCourse, members: updatedMembers };
        });
    }, [course?.id]);

    useCourseMemberDeclined((payload) => {
        if (!course || payload.courseId !== course.id) return;

        setCourse((prevCourse) => {
            if (!prevCourse) return prevCourse;

            const updatedMembers = prevCourse.members.filter((member) => member.user.id !== payload.userId);
            regroupMembers(updatedMembers);
            return { ...prevCourse, members: updatedMembers };
        });
    }, [course?.id]);

    useNewPost((payload) => {
        if (!course || payload.courseId !== course.id || !payload.post) return;

        setCourse((prevCourse) => {
            if (!prevCourse) return prevCourse;
            if (prevCourse.posts.some((post) => post.id === payload.post.id)) return prevCourse;

            return { ...prevCourse, posts: [payload.post, ...prevCourse.posts] };
        });
    }, [course?.id]);

    useCourseDeleted((payload) => {
        if (!course || payload.courseId !== course.id) return;

        notify("A kurzus törölve lett.", { type: "warning" });
        router.push("/dashboard");
    }, [course?.id, notify, router]);

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

                setCourse((prevCourse: Course | null) => {
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
                    const approvedStudent = unverifiedStudents.find((member) => member.user.id === studentId);
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

        const updatedCourses = session.user.courses.map((c: Course) => {
            if(c.id === course.id) {
                return course;
            }
            return c;
        });

        session.user.courses = updatedCourses;
    }, [course]);

    useEffect(() => {
        if (!course) return;

        setSettingsForm((prev) => ({
            ...prev,
            name: course.name,
            bannerUrl: course.backgroundImage?.path || "",
            color: course.color
        }));
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
        setColor(tmpCourse.color);
        setUnverifiedStudents(unverifiedStudents);

        const userMember = tmpCourse.members.find((member: any) => member.user.id === session.user?.id);
        setIsUserTeacher(userMember ? userMember.isTeacher : false);

        setTeacherNames(teachers.map((teacher: any) => `${teacher.user.first_name} ${teacher.user.last_name}`));
        setColor(tmpCourse.color);
        setColors(getColorsFromColorCode(tmpCourse.color));

        setSettings(tmpCourse.settings);

        handleSettingsChange("allowComments", tmpCourse.settings.allowComments);
        handleSettingsChange("showInviteCode", tmpCourse.settings.showInviteCode);
        handleSettingsChange("studentsCanCreatePosts", tmpCourse.settings.studentsCanCreatePosts);
        handleSettingsChange("allowedStudentPostTypes", tmpCourse.settings.allowedStudentPostTypes.map((pt: PostType) => pt.id));
        handleSettingsChange("autoApproveMembers", tmpCourse.settings.autoApproveMembers);
        handleSettingsChange("autoRejectMembers", tmpCourse.settings.autoRejectMembers);
    }, [session, status, courseId, router]);

    useEffect(() => {
        if(!color) return;
        
        handleSettingsChange("accentColor", color);
        setColors(getColorsFromColorCode(color));
    }, [color]);

    const handleSettingsChange = <K extends keyof CourseSettingsForm>(key: K, value: CourseSettingsForm[K]) => {
        if (key === "bannerUrl" && value instanceof File) {
            const reader = new FileReader();

            reader.onload = (e) => {
                setSettingsForm((prev) => ({
                    ...prev,
                    [key]: e.target?.result as string,
                }));
            };

            reader.readAsDataURL(value);
        } else {
            setSettingsForm((prev) => ({
                ...prev,
                [key]: value,
            }));
        }
    };

    const handleSettingsSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const response = await fetch(`/api/courses/${courseId}/settings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",            },
            body: JSON.stringify({
                name: settingsForm.name.trim(),
                accentColor: settingsForm.accentColor,
                allowComments: settingsForm.allowComments,
                showInviteCode: settingsForm.showInviteCode,
                studentsCanCreatePosts: settingsForm.studentsCanCreatePosts,
                allowedStudentPostTypes: settingsForm.allowedStudentPostTypes,
                autoApproveMembers: settingsForm.autoApproveMembers,
                autoRejectMembers: settingsForm.autoRejectMembers,
            }),
        });

        if(!response.ok) {
            notify("Hiba történt a beállítások mentésekor", {
                type: "error",
            });
            return;
        }

        switch(response.status) {
            case 200:
                setCourse((prevCourse) => {
                    if (!prevCourse) return prevCourse;

                    return {
                        ...prevCourse,
                        name: settingsForm.name.trim() || prevCourse.name,
                        color: settingsForm.accentColor,
                    };
                });

                setColor(settingsForm.accentColor);
                
                notify("Beállítások elmentve", {
                    type: "success",
                });
                break;
            case 400:
                notify("Érvénytelen adatok", {
                    type: "error",
                });
                break;
            case 403:
                notify("Nincs jogosultságod a művelet végrehajtásához", {
                    type: "error",
                });
                break;
            case 500:
                notify("Hiba történt a beállítások mentésekor", {
                    type: "error",
                });
                break;
            default:
                notify("Ismeretlen hiba történt", {
                    type: "error",
                });
        }
    };

    const tabs = [
        { id: "stream", label: "Hírfolyam", icon: Home, isVisible: true },
        { id: "assignments", label: "Feladatok", icon: ClipboardList, isVisible: true },
        { id: "members", label: "Résztvevők", icon: Users, isVisible: true },
        { id: "settings", label: "Beállítások", icon: Info, isVisible: isUserTeacher },
    ]

    const settingsTabs = [
        { id: "visual", label: "Megjelenés", icon: Palette },
        { id: "general", label: "Általános", icon: PenLine },
        { id: "permissions", label: "Jogosultságok", icon: Shield },
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
                            tab.isVisible && (
                                <Button 
                                    key={tab.id} 
                                    variant="ghost" 
                                    className={`${activeTab === tab.id ? `bg-primary/10` : ""} flex items-center space-x-2`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon className="h-5 w-5" style={{ color: activeTab === tab.id ? colors.neutralBgText : undefined }} />
                                    <span style={{ color: activeTab === tab.id ? colors.neutralBgText : undefined }}>{tab.label}</span>
                                </Button>
                            )
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
                                <div className="flex justify-center items-center p-3 rounded-full" style={colors.bg}>
                                    <Users className="h-6 w-6 text-white m-0" />
                                </div>
                                <h1 className="text-lg font-semibold">Tanárok</h1>
                            </CardHeader>
                            <CardContent>
                                {teachers.map((teacher: CourseMember, index: number) => (
                                    <div key={`teacher-${teacher.user.id}-${index}`} className="flex items-center space-x-4 mb-4 bg-card-foreground/10 p-2 rounded-lg">
                                        <UserAvatar user={teacher.user} size="large"/>
                                        <h1>{teacher.user.first_name} {teacher.user.last_name}</h1>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        {students.length > 0 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 p-6">
                                <div className="flex justify-center items-center p-3 rounded-full" style={colors.bg}>
                                    <Users className="h-6 w-6 text-white m-0" />
                                </div>
                                <h1 className="text-lg font-semibold">Tanulók</h1>
                            </CardHeader>
                            <CardContent>
                                {students.map((student: CourseMember, index: number) => (
                                    <div key={`student-${student.user.id}-${index}`} className="flex items-center space-x-4 mb-4 bg-card-foreground/10 p-2 rounded-lg">
                                        <UserAvatar user={student.user} size="large" />
                                        <h1>{student.user.first_name} {student.user.last_name}</h1>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        )}
                        {unverifiedStudents.length > 0 && isUserTeacher && (
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2 p-6">
                                <div className="flex justify-center items-center p-3 rounded-full" style={colors.bg}>
                                    <Info className="h-6 w-6 text-white m-0" />
                                </div>
                                <h1 className="text-lg font-semibold">Jóváhagyásra váró tanulók</h1>
                            </CardHeader>
                            <CardContent>
                                {unverifiedStudents.map((student: CourseMember, index: number) => (
                                    <div key={`unverified-student-${student.user.id}-${index}`} className="flex items-center justify-between space-x-4 mb-4 bg-card-foreground/10 p-2 rounded-lg">
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
                {activeTab === "settings" && (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_4fr] gap-6">
                        <div className="flex flex-col gap-4">
                            <Card className="flex flex-col gap-2 p-2">
                                {settingsTabs.map((tab) => (
                                    <Button 
                                        key={`settings-tab-${tab.id}`} 
                                        variant="ghost" 
                                        className={`justify-start ${activeSettingsTab === tab.id ? `bg-primary/10` : ""} flex items-center space-x-2 w-full`}
                                        onClick={() => setActiveSettingsTab(tab.id)}
                                    >
                                        <tab.icon className="h-5 w-5" style={{ color: activeSettingsTab === tab.id ? colors.neutralBgText : undefined }} />
                                        <span style={{ color: activeSettingsTab === tab.id ? colors.neutralBgText : undefined }}>{tab.label}</span>
                                    </Button>
                                ))}
                            </Card>
                        </div>
                        <form onSubmit={handleSettingsSave} className="space-y-4">
                            {/* Visual Settings */}
                            {activeSettingsTab === "visual" && (
                                <Card className="p-0 overflow-hidden">
                                    <div className="border-b border-border px-6 py-4">
                                        <h2 className="text-lg font-semibold">Megjelenés</h2>
                                        <p className="text-sm text-muted-foreground">A kurzus vizuális elemeinek testreszabása.</p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Course Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="course-name" className="text-sm font-medium">Kurzus neve</Label>
                                            <Input
                                                id="course-name"
                                                value={settingsForm.name}
                                                onChange={(event) => handleSettingsChange("name", event.target.value)}
                                                placeholder="Pl: Webfejlesztés 101"
                                            />
                                        </div>

                                        {/* Banner Image */}
                                        <div className="space-y-2">
                                            <Label htmlFor="banner-url" className="text-sm font-medium">Banner kép</Label>
                                            
                                            <BannerUploadButton
                                                onUpload={(file: File) => handleSettingsChange("bannerUrl", file)}
                                                defaultImage={course.backgroundImage?.path || undefined}
                                            />
                                            {(settingsForm.bannerUrl || course.backgroundImage) && (
                                                <div className="w-full flex justify-end">
                                                    <Button variant="outline" size="lg" className="w-full" onClick={() => handleSettingsChange("bannerUrl", "")}>
                                                        Banner eltávolítása
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="accent-color" className="text-sm font-medium">Kurzus szín</Label>
                                            <p className="text-xs text-muted-foreground">Ez a szín jelenik meg a kurzus fejlécén és a kiemeléseken.</p>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Input
                                                        id="accent-color"
                                                        type="color"
                                                        value={settingsForm.accentColor}
                                                        onChange={(event) => handleSettingsChange("accentColor", event.target.value)}
                                                        className="h-10 w-14 cursor-pointer rounded-lg border-2 border-border p-1"
                                                    />
                                                </div>
                                                <Input
                                                    value={settingsForm.accentColor}
                                                    onChange={(event) => handleSettingsChange("accentColor", event.target.value)}
                                                    placeholder="#3b82f6"
                                                    className="max-w-40 font-mono text-sm"
                                                />
                                                <div
                                                    className="h-10 flex-1 rounded-lg"
                                                    style={{ backgroundColor: settingsForm.accentColor }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end pt-2 border-border">
                                            <Button type="submit">Mentés</Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {activeSettingsTab === "general" && (
                                <Card className="p-0 overflow-hidden">
                                    <div className="border-b border-border px-6 py-4">
                                        <h2 className="text-lg font-semibold">Általános beállítások</h2>
                                        <p className="text-sm text-muted-foreground">Az új bejegyzések alapértelmezett beállításai.</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                                            <div className="flex gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                    <PenLine className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Hozzászólások engedélyezése</p>
                                                    <p className="text-sm text-muted-foreground">Az új bejegyzéseknél alapértelmezetten engedélyezve lesznek a hozzászólások.</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settingsForm.allowComments}
                                                onCheckedChange={(value) => handleSettingsChange("allowComments", value)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-end pt-2 border-border">
                                            <Button type="submit">Mentés</Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* User Permissions */}
                            {activeSettingsTab === "permissions" && (
                                <Card className="p-0 overflow-hidden">
                                    <div className="border-b border-border px-6 py-4">
                                        <h2 className="text-lg font-semibold">Jogosultságok</h2>
                                        <p className="text-sm text-muted-foreground">Tanulói jogosultságok és csatlakozási beállítások kezelése.</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                                            <div className="flex gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                    <Eye className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Meghívó kód megjelenítése</p>
                                                    <p className="text-sm text-muted-foreground">A kurzus meghívókódja látható a tanulók számára.</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={settingsForm.showInviteCode}
                                                onCheckedChange={(value) => handleSettingsChange("showInviteCode", value)}
                                            />
                                        </div>

                                        <div className="rounded-lg border border-border overflow-hidden">
                                            <div className="border-b border-border bg-muted/30 px-4 py-3">
                                                <p className="text-sm font-medium">Tanulói bejegyzések</p>
                                                <p className="text-xs text-muted-foreground">Állítsd be a tanulók jogosultságait a bejegyzésekhez.</p>
                                            </div>
                                            <div className="divide-y divide-border">
                                                <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
                                                    <div className="flex gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/15">
                                                            <PenLine className="h-5 w-5 text-chart-2" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Tanulói bejegyzések</p>
                                                            <p className="text-sm text-muted-foreground">Engedélyezi a tanulóknak, hogy új bejegyzéseket hozzanak létre.</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settingsForm.studentsCanCreatePosts}
                                                        onCheckedChange={(value) => handleSettingsChange("studentsCanCreatePosts", value)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
                                                    <div className="flex gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                                                            <NotebookPen className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Engedélyezett bejegyzés típusok</p>
                                                            <p className="text-sm text-muted-foreground">A tanulók csak az engedélyezett típusú bejegyzéseket hozhatják létre.</p>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild disabled={!settingsForm.studentsCanCreatePosts}>
                                                            <Button variant="outline" size="sm">
                                                                {settingsForm.allowedStudentPostTypes && settingsForm.allowedStudentPostTypes.length == 0 && (
                                                                    <span>Egyik sem</span>
                                                                )}

                                                                {settingsForm.allowedStudentPostTypes && settingsForm.allowedStudentPostTypes.length == 1 && (
                                                                    <span>
                                                                        {postTypeMappings[postTypes.find(t => t.id === settingsForm.allowedStudentPostTypes[0])?.name || ""]?.title || "Ismeretlen típus"}
                                                                    </span>
                                                                )}
                                                                
                                                                {settingsForm.allowedStudentPostTypes && settingsForm.allowedStudentPostTypes.length > 1 && settingsForm.allowedStudentPostTypes.length <= 2 && (
                                                                    <span>
                                                                        {settingsForm.allowedStudentPostTypes.map((id, i) => {
                                                                            const type = postTypes.find(t => t.id === id);
                                                                            return (
                                                                                <span key={i}>{postTypeMappings[type?.name || ""]?.title || "Ismeretlen típus"}{i < settingsForm.allowedStudentPostTypes.length - 1 ? ", " : ""}</span>
                                                                            )
                                                                        })}
                                                                    </span>
                                                                )}
                                                                
                                                                {settingsForm.allowedStudentPostTypes && settingsForm.allowedStudentPostTypes.length > 2 && settingsForm.allowedStudentPostTypes.length < postTypes.length && (
                                                                    <span>{settingsForm.allowedStudentPostTypes.length} típus</span>
                                                                )}

                                                                {settingsForm.allowedStudentPostTypes && settingsForm.allowedStudentPostTypes.length > 0 &&  settingsForm.allowedStudentPostTypes.length === postTypes.length && (
                                                                    <span>Összes</span>
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {postTypes.map((type) => (
                                                                <DropdownMenuItem 
                                                                    key={type.id} 
                                                                    onSelect={(event) => {
                                                                        event.preventDefault();
                                                                        const currentTypes = settingsForm.allowedStudentPostTypes || [];
                                                                        if (currentTypes.includes(type.id)) {
                                                                            handleSettingsChange("allowedStudentPostTypes", currentTypes.filter((id) => id !== type.id));
                                                                        } else {
                                                                            handleSettingsChange("allowedStudentPostTypes", [...currentTypes, type.id]);
                                                                        }
                                                                    }}
                                                                className={`flex items-center gap-2 mb-1 ${settingsForm.allowedStudentPostTypes?.includes(type.id) ? "bg-primary/10 text-primary" : ""}`}
                                                                >
                                                                    {postTypeMappings[type.name]?.title || type.name}
                                                                </DropdownMenuItem>
                                                            ))}

                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-border overflow-hidden">
                                            <div className="border-b border-border bg-muted/30 px-4 py-3">
                                                <p className="text-sm font-medium">Csatlakozási szabályok</p>
                                                <p className="text-xs text-muted-foreground">Állítsd be, az új jelentkezések kezelését.</p>
                                            </div>
                                            <div className="divide-y divide-border">
                                                <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
                                                    <div className="flex gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/15">
                                                            <Users className="h-5 w-5 text-chart-2" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Automatikus jóváhagyás</p>
                                                            <p className="text-sm text-muted-foreground">Az új jelentkezők azonnal csatlakoznak a kurzushoz.</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        disabled={settingsForm.autoRejectMembers}
                                                        checked={settingsForm.autoApproveMembers}
                                                        onCheckedChange={(value) => handleSettingsChange("autoApproveMembers", value)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
                                                    <div className="flex gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15">
                                                            <Shield className="h-5 w-5 text-destructive" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Automatikus elutasítás</p>
                                                            <p className="text-sm text-muted-foreground">Az új jelentkezők automatikusan elutasításra kerülnek.</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        disabled={settingsForm.autoApproveMembers}
                                                        checked={settingsForm.autoRejectMembers}
                                                        onCheckedChange={(value) => handleSettingsChange("autoRejectMembers", value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end pt-2 border-border">
                                            <Button type="submit">Mentés</Button>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
"use client";

import { Course, CourseMember } from "@studify/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Brush, ClipboardList, Home, Info, Users } from "lucide-react";

import { UserAvatar } from "@/components/elements/avatar";
import NoPostsCard from "@/components/elements/posts/no-posts-card";
import NewPostDialog from "@/components/elements/posts/post-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { generateColorFromInvitationCode } from "@/lib/dashboard/utils";

import CourseBanner from "@/components/elements/course-banner";
import PostCard from "@/components/elements/posts/post-card";

import { useNotificationProvider } from "@/components/notification-provider";
import { Post, Submission } from "@studify/types";

type CourseSettingsForm = {
    name: string;
    description: string;
    showInviteCode: boolean;
    allowComments: boolean;
    bannerUrl: string;
    accentColor: string;
    autoApproveMembers: boolean;
    autoRejectMembers: boolean;
};

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = React.use(params);

    const router = useRouter()

    const { notify } = useNotificationProvider();
    const { data: session, status } = useSession();

    const [activeTab, setActiveTab] = useState<string>("stream");
    const [activeSettingsTab, setActiveSettingsTab] = useState<string>("general");

    const [isUserTeacher, setIsUserTeacher] = useState<boolean>(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [teachers, setTeachers] = useState<CourseMember[]>([]);
    const [students, setStudents] = useState<CourseMember[]>([]);
    const [unverfiedStudents, setUnverifiedStudents] = useState<CourseMember[]>([]);
    
    const [teacherNames, setTeacherNames] = useState<string[]>([]);
    const [colors, setColors] = useState<{ bg: string; text: string, neutralBgText: string }>({ bg: '', text: '', neutralBgText: '' });
    const [settingsForm, setSettingsForm] = useState<CourseSettingsForm>({
        name: "",
        description: "",
        showInviteCode: true,
        allowComments: true,
        bannerUrl: "",
        accentColor: "#3b82f6",
        autoApproveMembers: false,
        autoRejectMembers: false,
    });

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
        if (!course) return;

        setSettingsForm((prev) => ({
            ...prev,
            name: course.name,
            bannerUrl: course.backgroundImage?.path || "",
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
        setUnverifiedStudents(unverifiedStudents);

        const userMember = tmpCourse.members.find((member: any) => member.user.id === session.user?.id);
        setIsUserTeacher(userMember ? userMember.isTeacher : false);

        setTeacherNames(teachers.map((teacher: any) => `${teacher.user.first_name} ${teacher.user.last_name}`));
        setColors(generateColorFromInvitationCode(tmpCourse.invitationCode));
    }, [session, status, courseId, router]);

    const handleSettingsChange = <K extends keyof CourseSettingsForm>(key: K, value: CourseSettingsForm[K]) => {
        setSettingsForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSettingsSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setCourse((prevCourse) => {
            if (!prevCourse) return prevCourse;
            return {
                ...prevCourse,
                name: settingsForm.name.trim() || prevCourse.name,
            };
        });

        notify("Beallitasok elmentve", {
            type: "success",
            description: "A valtozasok jelenleg csak ezen az oldalon latszanak.",
        });
    };

    const tabs = [
        { id: "stream", label: "Hírfolyam", icon: Home, isVisible: true },
        { id: "assignments", label: "Feladatok", icon: ClipboardList, isVisible: true },
        { id: "members", label: "Résztvevők", icon: Users, isVisible: true },
        { id: "settings", label: "Beállítások", icon: Info, isVisible: isUserTeacher },
    ]

    const settingsTabs = [
        { id: "general", label: "Általános", icon: Info },
        { id: "appearance", label: "Megjelenés", icon: Brush },
        { id: "Tagok", label: "Tagok", icon: Users },
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
                                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? colors.neutralBgText : ""}`} />
                                    <span className={activeTab === tab.id ? colors.neutralBgText : ""}>{tab.label}</span>
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
                                        <tab.icon className={`h-5 w-5 ${activeSettingsTab === tab.id ? colors.neutralBgText : ""}`} />
                                        <span className={activeSettingsTab === tab.id ? colors.neutralBgText : ""}>{tab.label}</span>
                                    </Button>
                                ))}
                            </Card>
                        </div>
                        <form onSubmit={handleSettingsSave} className="space-y-4">
                            {activeSettingsTab === "general" && (
                                <Card className="p-4 space-y-6">
                                    <div>
                                        <h1 className="text-lg font-semibold mb-2">Általános beállítások</h1>
                                        <p className="text-sm text-muted-foreground">A kurzus alapadatai és jogosultságai.</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                                        <div>
                                            <p className="font-medium">Meghívó kód megjelenítése</p>
                                            <p className="text-sm text-muted-foreground">A kurzus meghívókódja megjelenítése a tanulók számára.</p>
                                        </div>
                                        <Switch
                                            checked={settingsForm.showInviteCode}
                                            onCheckedChange={(value) => handleSettingsChange("showInviteCode", value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                                        <div>
                                            <p className="font-medium">Posztokhoz való hozzászólások engedélyezése</p>
                                            <p className="text-sm text-muted-foreground">Engedélyezi a tanulóknak, hogy hozzászóljanak a kurzus posztjaihoz.</p>
                                        </div>
                                        <Switch
                                            checked={settingsForm.allowComments}
                                            onCheckedChange={(value) => handleSettingsChange("allowComments", value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Button type="submit">Mentés</Button>
                                    </div>
                                </Card>
                            )}
                            {activeSettingsTab === "appearance" && (
                                <Card className="p-4 space-y-6">
                                    <div>
                                        <h1 className="text-lg font-semibold mb-2">Megjelenés beállítások</h1>
                                        <p className="text-sm text-muted-foreground">Vizuális elemek testreszabása.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="course-name">Kurzus neve</Label>
                                        <Input
                                            id="course-name"
                                            value={settingsForm.name}
                                            onChange={(event) => handleSettingsChange("name", event.target.value)}
                                            placeholder="Pelda: Webfejlesztes 101"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="banner-url">Banner kep URL</Label>
                                        <Input
                                            id="banner-url"
                                            value={settingsForm.bannerUrl}
                                            onChange={(event) => handleSettingsChange("bannerUrl", event.target.value)}
                                            placeholder="https://..."
                                        />
                                        <p className="text-xs text-muted-foreground">Ha nincs megadva, az alapertelmezett banner marad.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accent-color">Akcent szin</Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="accent-color"
                                                type="color"
                                                value={settingsForm.accentColor}
                                                onChange={(event) => handleSettingsChange("accentColor", event.target.value)}
                                                className="h-10 w-16 p-1"
                                            />
                                            <Input
                                                value={settingsForm.accentColor}
                                                onChange={(event) => handleSettingsChange("accentColor", event.target.value)}
                                                placeholder="#3b82f6"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Button type="submit">Mentés</Button>
                                    </div>
                                </Card>
                            )}
                            {activeSettingsTab === "Tagok" && (
                                <Card className="p-4 space-y-6">
                                    <div>
                                        <h1 className="text-lg font-semibold mb-2">Jelentkezések beállításai</h1>
                                        <p className="text-sm text-muted-foreground">Jelentkezések és jogosultságok kezelése.</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                                        <div>
                                            <p className="font-medium">Jelentkezések autómatikus jóváhagyása</p>
                                            <p className="text-sm text-muted-foreground">Az új jelentkezők azonnal csatlakoznak.</p>
                                        </div>
                                        <Switch
                                            disabled={settingsForm.autoRejectMembers}
                                            checked={settingsForm.autoApproveMembers}
                                            onCheckedChange={(value) => handleSettingsChange("autoApproveMembers", value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                                        <div>
                                            <p className="font-medium">Jelentkezések autómatikus elutasítása</p>
                                            <p className="text-sm text-muted-foreground">Az új jelentkezők automatikusan elutasítva lesznek.</p>
                                        </div>
                                        <Switch
                                            disabled={settingsForm.autoApproveMembers}
                                            checked={settingsForm.autoRejectMembers}
                                            onCheckedChange={(value) => handleSettingsChange("autoRejectMembers", value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Button type="submit">Mentés</Button>
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
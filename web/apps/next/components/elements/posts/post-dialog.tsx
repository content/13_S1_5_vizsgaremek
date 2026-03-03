"use client";


import { format, set } from "date-fns";

import { Button } from "@/components/ui/button";
import { ChevronDownIcon, Clock2Icon, File, Pencil, Plus, Trash2 } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import React, { useEffect, useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { UploadDropzone } from "@/components/uploadthing/uploadthing";
import { useNotificationProvider } from "@/components/notification-provider";
import { useSession } from "next-auth/react";
import { Course, Post, PostType } from "@studify/types";
import AttachmentUploadCard from "../attachments/attachment-upload-card";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { InputOTPGroup } from "@/components/ui/input-otp";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group-addon";
import DateSelector from "../date-selector";

const newPostModalPages = [
    "PostDetails",
    "Settings",
    "PollOptions",
    "Attachments",
];

const postTypeMappings: { [key: string]: string } = {
    "ANNOUNCEMENT": "Közlemény",
    "ASSIGNMENT": "Feladat",
    "QUESTION": "Kérdés",
    "RESOURCE": "Tananyag",
    "POLL": "Felmérés"
};

type newPostDialogProps = {
    course: Course;
    onNewPostCreated?: (post: Post) => void;
};

export default function NewPostDialog({ course, onNewPostCreated }: newPostDialogProps) {    
    const { data: session, status } = useSession();
    const { notify } = useNotificationProvider();

    const [allowedPostTypes, setAllowedPostTypes] = useState<PostType[] | null>(null);

    const [newPostModalOpen, setNewPostModalOpen] = useState<boolean>(false);
    const [currNewPostModalPage, setCurrentNewPostModalPage] = useState<string>(newPostModalPages[0]);

    const [nextNewPostModalPage, setNextNewPostModalPage] = useState<string | null>(newPostModalPages[3]);
    const [prevNewPostModalPage, setPrevNewPostModalPage] = useState<string | null>(null);

    const [newPostName, setNewPostName] = useState<string>("");
    const [newPostDescription, setNewPostDescription] = useState<string>("");

    const [postTypes, setPostTypes] = useState<{id: number, name: string}[]>([]);
    const [selectedPostType, setSelectedPostType] = useState<string>("ANNOUNCEMENT");
    const [selectedPostTypeId, setSelectedPostTypeId] = useState<number>(1);
    
    const [isDeadlineEnabled, setIsDeadlineEnabled] = useState<boolean>(false);
    const [canBeSubmittedAfterDeadline, setCanBeSubmittedAfterDeadline] = useState<boolean>(false);
    const [date, setDate] = useState<Date>(new Date());
    const [maxScore, setMaxScore] = useState<number | null>(null);

    const [pollOptions, setPollOptions] = useState<string[]>([]);

    const [attachments, setAttachments] = useState<Map<string, string[]>>(new Map());
    const [isCreatingPostBtnDisabled, setIsCreatingPostBtnDisabled] = useState<boolean>(false);

    const MIN_POLL_OPTIONS = 2;
    const MAX_POLL_OPTIONS = 8;

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < MAX_POLL_OPTIONS) {
            setPollOptions([...pollOptions, ""]);
        }
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > MIN_POLL_OPTIONS) {
            const newOptions = pollOptions.filter((_, i) => i !== index);
            setPollOptions(newOptions);
        }
    };

    const handleNewPostCreation = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if(!newPostName || newPostName.trim() === "") {
            notify("A poszt elnevezése kötelező!", { type: "error" });
            return;
        }

        if(!session || !session.user || !session.user.id) {
            notify("Nem vagy bejelentkezve!", { type: "error", description: "Jelentkezz be a poszt létrehozásához." });
            return;
        }

        setIsCreatingPostBtnDisabled(true);

        try {
            const attachmentz = Array.from(attachments.entries()).map(([name, [url, _type]]) => ({path: url, name: name}));

            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    courseId: course.id,
                    postTypeId: selectedPostTypeId,
                    name: newPostName,
                    description: newPostDescription,
                    deadlineAt: isDeadlineEnabled && date ? date.toISOString() : null,
                    pollPostOptions: selectedPostType === "POLL" ? pollOptions.filter(option => option.trim() !== "") : [],
                    attachments: attachmentz,
                    maxScore: maxScore,
                }),
            });

            switch(response.status) {
                case 201:
                    notify("Poszt sikeresen létrehozva!", { type: "success" });
                    setNewPostModalOpen(false);

                    // Reset form
                    setCurrentNewPostModalPage(newPostModalPages[0]);
                    setNewPostName("");
                    setNewPostDescription("");
                    setSelectedPostTypeId(0);
                    setIsDeadlineEnabled(false);
                    setCanBeSubmittedAfterDeadline(false);
                    setDate(undefined);
                    setPollOptions([]);
                    setAttachments(new Map());

                    if(onNewPostCreated) {
                        const createdPost: Post = (await response.json()).post;
                        onNewPostCreated(createdPost);
                    }

                    break;
                case 400:
                    notify("Érvénytelen poszt típus!", { type: "error" });
                    break;
                case 401:
                    notify("Nem vagy bejelentkezve!", { type: "error", description: "Jelentkezz be a poszt létrehozásához." });
                    break;
                case 404:
                    notify("Kurzus nem található!", { type: "error" });
                    break;
                default:
                    notify("Hiba történt a poszt létrehozásakor.", { type: "error" });
                    break;
            }
        } catch (error) {
            console.error('Error creating post:', error);
            notify("Hiba történt a poszt létrehozásakor.", { type: "error" });
        } finally {
            setIsCreatingPostBtnDisabled(false);
        }
    };

    useEffect(() => {
        if(isDeadlineEnabled) return;

        setCanBeSubmittedAfterDeadline(false);
    }, [isDeadlineEnabled]);

    useEffect(() => {
        const selectedType = postTypes.find(pt => pt.id === selectedPostTypeId);
        if(selectedType) {
            setSelectedPostType(selectedType.name);
        }
    }, [selectedPostTypeId, postTypes]);

    useEffect(() => {
        if(status === "loading") return;
        if(!session || !session.user) return;
        if(!course || !course.members) return;
        if(!postTypes || postTypes.length === 0) return;

        const isTeacher = course.members.some(member => member.user.id === session.user?.id && member.isTeacher);
        
        setAllowedPostTypes(isTeacher ? postTypes as PostType[] : course.settings.allowedStudentPostTypes);
    }, [session, status, course, postTypes]);

    useEffect(() => {
        const isPollSelected = selectedPostType === "POLL";
        const isAnnouncementSelected = selectedPostType === "ANNOUNCEMENT";
        const isResourceSelected = selectedPostType === "RESOURCE";

        if(currNewPostModalPage === newPostModalPages[0]) {
            setPrevNewPostModalPage(null);
            setNextNewPostModalPage(newPostModalPages[isAnnouncementSelected || isResourceSelected ? 3 : 1]);
        }

        if(currNewPostModalPage === newPostModalPages[1]) {
            setPrevNewPostModalPage(newPostModalPages[0]);
            setNextNewPostModalPage(newPostModalPages[isPollSelected ? 2 : 3]);
        }
        
        if(currNewPostModalPage === newPostModalPages[2]) {
            if(pollOptions.length < MIN_POLL_OPTIONS) {
                setPollOptions(prev => {
                    const newOptions = [...prev];
                    while(newOptions.length < MIN_POLL_OPTIONS) {
                        newOptions.push("");
                    }
                    return newOptions;
                });
            }
            setPrevNewPostModalPage(newPostModalPages[1]);
            setNextNewPostModalPage(newPostModalPages[3]);
        }

        if(currNewPostModalPage === newPostModalPages[3]) {
            setPrevNewPostModalPage(newPostModalPages[isAnnouncementSelected || isResourceSelected ? 0 : isPollSelected ? 2 : 1]);
            setNextNewPostModalPage(null);
        }
    }, [currNewPostModalPage, selectedPostType]);

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

    return (
        <Dialog open={newPostModalOpen} onOpenChange={setNewPostModalOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent" onClick={(e) => {setNewPostModalOpen(true)}} disabled={postTypes.length === 0}>
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
                <form onSubmit={(e) => handleNewPostCreation(e)}>
                    {currNewPostModalPage === newPostModalPages[0] && (
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
                                value={newPostName}
                                onChange={(e) => setNewPostName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="post-type" className="text-sm font-medium leading-none">
                                Poszt típusa
                            </label>
                            <select
                                id="post-type"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedPostTypeId}
                                onChange={(e) => setSelectedPostTypeId(+e.target.value)}
                            >
                                {allowedPostTypes && allowedPostTypes.map((type) => (
                                    <option key={`POST_TYPE_ID_${type.id}`} value={type.id}>
                                        {postTypeMappings[type.name] || type.name}
                                    </option>
                                ))}
                            </select>
                            {selectedPostTypeId === postTypes.find(pt => pt.name === "ASSIGNMENT")?.id && (
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
                                value={newPostDescription}
                                onChange={(e) => setNewPostDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    )}
                    {currNewPostModalPage === newPostModalPages[1] && (
                        <div className="grid gap-8 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="post-deadline" className="text-sm font-medium leading-none">Határidő</label>
                                <div className="flex gap-2 items-center w-full">
                                    <Checkbox name="deadline-checkbox" className="w-6 h-6" checked={isDeadlineEnabled} onCheckedChange={(e) => setIsDeadlineEnabled(e)}></Checkbox>
                                    <DateSelector defaultDate={date} onDateChange={setDate} disablePast={true} disabled={!isDeadlineEnabled} className="w-full">
                                        <Button
                                            disabled={!isDeadlineEnabled}
                                            variant="outline"
                                            data-empty={!date}
                                            className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal"
                                            
                                        >
                                            {date ? format(date, "PPP") : <span>Válassz egy dátumot</span>}
                                            <ChevronDownIcon />
                                        </Button>
                                    </DateSelector>
                                </div>
                                <Field orientation="horizontal" data-disabled>
                                    <Checkbox name="canBeSubmitted-checkbox" className="w-6 h-6" checked={canBeSubmittedAfterDeadline} onCheckedChange={(e) => setCanBeSubmittedAfterDeadline(e)} disabled={!isDeadlineEnabled}></Checkbox>
                                    <FieldLabel htmlFor="canBeSubmitted-checkbox" className={`${!canBeSubmittedAfterDeadline ? "text-muted-foreground" : ""}`}>Leadható határidő után</FieldLabel>
                                </Field>
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="max-score" className="text-sm font-medium leading-none">Maximális pontszám (opcionális)</label>
                                <input
                                    type="number"
                                    id="max-score"
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                                    placeholder="Maximális pontszám"
                                    value={maxScore !== null ? maxScore : ''}
                                    onChange={(e) => setMaxScore(e.target.value ? parseInt(e.target.value) : null)}
                                />
                            </div>
                        </div>
                    )}
                    {currNewPostModalPage === newPostModalPages[2] && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">
                                    Felmérés lehetőségei
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    Add meg a felmérés lehetőségeit (maximum {MAX_POLL_OPTIONS}).
                                </p>
                            </div>
                            <div className="grid gap-3 max-h-[300px] overflow-y-auto py-3 pr-1 new-post-dialog-poll-options-scrollbar">
                                {pollOptions.map((option, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium shrink-0">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                                            placeholder={`${index + 1}. lehetőség`}
                                            value={option}
                                            onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed"
                                            onClick={() => removePollOption(index)}
                                            disabled={pollOptions.length <= MIN_POLL_OPTIONS}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Törlés</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {pollOptions.length < MAX_POLL_OPTIONS && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full gap-2 bg-transparent"
                                    onClick={addPollOption}
                                >
                                    <Plus className="h-4 w-4" />
                                    Új lehetőség hozzáadása
                                </Button>
                            )}
                            {pollOptions.length >= MAX_POLL_OPTIONS && (
                                <p className="text-sm text-muted-foreground text-center">
                                    Elérted a maximális lehetőségek számát.
                                </p>
                            )}
                        </div>
                    )}
                    {currNewPostModalPage === newPostModalPages[3] && (
                        <div className="py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none">
                                    Csatolt mellékletek
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    Adj fájlokat a poszthoz.
                                </p>
                            </div>
                            <UploadDropzone
                                className="border-border bg-background hover:bg-accent/50 transition-colors"
                                endpoint="fileUploader"
                                onClientUploadComplete={(res) => {
                                    for (const file of res) {
                                        const name = file?.name;
                                        const url = file?.ufsUrl;
                                        const type = file?.type;
                                        
                                        if(url && name) {
                                            notify("Sikeres feltöltés!", { type: "success", description: "A profilképed sikeresen feltöltve." });
                                        
                                            setAttachments(prev => new Map(prev).set(name, [url, type]));
                                        }
                                    }
                                    setIsCreatingPostBtnDisabled(false);
                                }}
        
                                onUploadProgress={(progress) => {
                                    setIsCreatingPostBtnDisabled(progress < 100);
                                }}
        
                                onUploadError={(error: Error) => {
                                    notify("Hiba a kép feltöltése során!", { type: "error", description: "Próbáld újra később!" });
                                    setIsCreatingPostBtnDisabled(false);
                                }}
                            />

                            <div className="mt-4">
                                {Array.from(attachments.entries()).map(([name, [url, type]]) => (
                                    <AttachmentUploadCard key={`ATTACHMENT_UPLOADED_${name}`} name={name} url={url} type={type} onRemove={(name) => {
                                        setAttachments(prev => {
                                            const newAttachments = new Map(prev);
                                            newAttachments.delete(name);
                                            return newAttachments;
                                        });
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                </form>
                <DialogFooter className="flex !justify-between items-center w-full">
                    {prevNewPostModalPage && (
                        <p className="cursor-pointer hover:underline m-0" onClick={(e) => setCurrentNewPostModalPage(prevNewPostModalPage!)}>
                            Vissza
                        </p>
                    )}
                    {nextNewPostModalPage && (
                        <>
                            <div></div>
                            <Button onClick={(e) => setCurrentNewPostModalPage(nextNewPostModalPage)}>
                                Tovább
                            </Button>
                        </>
                    )}
                    {!nextNewPostModalPage && (
                        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isCreatingPostBtnDisabled} onClick={(e) => handleNewPostCreation(e)}>
                            Létrehozás
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
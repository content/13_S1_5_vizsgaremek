import { Submission, Post } from "@studify/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React from "react";
import { FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotificationProvider } from "@/components/notification-provider";
import submissionStatusMappings from "@/lib/dashboard/submissionStatusMappings"
import { useSession } from "next-auth/react";

type GradeDialogProps = {
    submission: Submission;
    post: Post;
    isOpen: boolean;
    onClose: () => void;
    onGrade?: () => void;
    children?: React.ReactNode;
}

export default function GradeDialog({ submission, post, children, isOpen, onClose, onGrade }: GradeDialogProps) {
    const [isOpenState, setIsOpenState] = React.useState(isOpen);
    
    const { data: session } = useSession();
    const { notify } = useNotificationProvider();

    const [score, setScore] = React.useState<number | "">(submission.score ?? "");


    const gradeSubmission = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!session || !session.user) {
            notify("Nem vagy bejelentkezve!", { type: "error" });
            return;
        }

        const response = await fetch("/api/submissions/grade", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                postId: post.id,
                userId: session.user.id,
                submissionId: submission.id,
                score: score,
                statusId: 3
            })
        });

        switch(response.status) {
            case 200:
                notify("A feladat sikeresen értékelve lett!", { type: "success" });
                if(onGrade) onGrade();
                setIsOpenState(false);
                onClose();
                break;
            case 403:
                notify("Nincs jogosultságod a feladat értékeléséhez!", { type: "error" });
                break;
            case 404:
                notify("A feladat vagy a beadás nem található!", { type: "error" });
                break;
            case 500:
                notify("Hiba történt a feladat értékelése során!", { type: "error" });
                break;
            default:
                notify("Ismeretlen hiba történt!", { type: "error" });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpenState(open);
            if(!open) onClose();
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Feladat értékelése</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={gradeSubmission}>
                    <FieldSet>
                        <Label htmlFor="score">
                            Pontszám megadása (Max: {post.maxScore})
                        </Label>
                        <Input id="score" type="number" max={post.maxScore.toString()} value={score} onChange={(e) => {
                            if(isNaN(Number(e.target.value)) && e.target.value !== "") return;
                            if(Number(e.target.value) > post.maxScore) {
                                setScore(post.maxScore);
                                return;
                            }
                            setScore(e.target.value === "" ? "" : Number(e.target.value))
                        }} />
                    </FieldSet>
                    <Button type="submit" variant="default" className="w-full mt-4">
                        Értékelés mentése
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
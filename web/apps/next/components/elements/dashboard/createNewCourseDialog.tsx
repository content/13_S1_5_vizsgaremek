import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BannerUploadButton from "../attachments/banner-upload-button";

type CreateNewCourseDialogProps = {
    createDialogOpen: boolean;
    setCreateDialogOpen: (open: boolean) => void;
    newCourseName: string;
    setNewCourseName: (name: string) => void;
    newCourseBackgroundImageUrl: string | null;
    handleBannerUpload: (file: File) => Promise<void>;
    isNewCourseCreateBtnDisabled: boolean;
    handleCreateCourse: () => Promise<void>;
}

export default function CreateNewCourseDialog(props: CreateNewCourseDialogProps) {
    const { createDialogOpen, setCreateDialogOpen, newCourseName, setNewCourseName, newCourseBackgroundImageUrl, handleBannerUpload, isNewCourseCreateBtnDisabled, handleCreateCourse } = props;
    return (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Kurzus létrehozása</DialogTitle>
                    <DialogDescription>
                        Töltsd ki az adatokat egy új kurzus létrehozásához. Később meghívhatod a diákokat.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="course-name">Kurzus neve</Label>
                        <Input id="course-name" placeholder="Matematika" onChange={(e) => setNewCourseName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="course-background-image-url">Kurzus háttérképe</Label>
                        <BannerUploadButton
                            onUpload={(file: File) => void handleBannerUpload(file)}
                            defaultImage={newCourseBackgroundImageUrl || undefined}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Mégse
                    </Button>
                    <Button disabled={isNewCourseCreateBtnDisabled} onClick={() => handleCreateCourse()}>
                        Kurzus létrehozása
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
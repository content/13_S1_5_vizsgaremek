import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { Post, User } from "@studify/types"

type PostMessageModalProps = {
    post: Post;
    sender: User;
    receiver: User;
    children?: React.ReactNode;

    isOpen: boolean;
    onClose: () => void;
}

export default function PostMessagesDialog({ post, sender, receiver, children, isOpen, onClose }: PostMessageModalProps) {
    
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }}}
        >
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Üzenetek</DialogTitle>
                </DialogHeader>
                <p>Messages here</p>
            </DialogContent>
        </Dialog> 
    )
}
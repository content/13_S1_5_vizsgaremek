'use client';

import type { DefaultEventsMap } from '@socket.io/component-emitter';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { socket } from '../socket';
import { useNotificationProvider } from './notification-provider';
import { Course, CourseMember, Post, Submission } from '@studify/types';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Users, FileText, CheckCircle, XCircle, UserPlus, UserMinus, BookOpen, GraduationCap, MessageCircle, Settings, Shield } from 'lucide-react';

// Event payload types
interface CourseCreatedEvent {
    id: number;
    name: string;
    invitationCode: string;
}

interface CourseMemberEvent {
    course: Course;
    member: CourseMember;
}

interface CourseMemberActionEvent {
    courseId: number;
    userId: number;
}

interface CourseDeletedEvent {
    courseId: number;
}

interface PostCreatedEvent {
    post: Post;
    courseId: number;
}

interface SubmissionEvent {
    submission: Submission;
    postId: number;
    courseId: number;
}

interface CommentCreatedEvent {
    comment: any;
    post: Post;
    courseId: number;
}

interface PrivateMessageEvent {
    message: any;
    senderId: number;
    recipientId: number;
}

interface CourseSettingsUpdatedEvent {
    course: Course;
    settings: any;
}

interface CourseMemberPromotedEvent {
    course: Course;
    member: CourseMember;
}

interface CourseMemberDemotedEvent {
    course: Course;
    member: CourseMember;
}

type SocketProviderProps = {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | undefined;
    isConnected: boolean;
    id?: string;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    
    // Event subscription methods
    onCourseCreated: (callback: (data: CourseCreatedEvent) => void) => () => void;
    onCourseMemberJoin: (callback: (data: CourseMemberEvent) => void) => () => void;
    onCourseMemberLeave: (callback: (data: CourseMemberActionEvent) => void) => () => void;
    onCourseMemberApproved: (callback: (data: CourseMemberEvent) => void) => () => void;
    onCourseMemberDeclined: (callback: (data: CourseMemberEvent) => void) => () => void;
    onCourseDeleted: (callback: (data: CourseDeletedEvent) => void) => () => void;
    onNewPost: (callback: (data: PostCreatedEvent) => void) => () => void;
    onSubmissionCreated: (callback: (data: SubmissionEvent) => void) => () => void;
    onSubmissionSubmitted: (callback: (data: SubmissionEvent) => void) => () => void;
    onSubmissionUnsubmitted: (callback: (data: SubmissionEvent) => void) => () => void;
    onSubmissionGraded: (callback: (data: SubmissionEvent) => void) => () => void;
    onSubmissionEdited: (callback: (data: SubmissionEvent) => void) => () => void;
    onCommentCreated: (callback: (data: CommentCreatedEvent) => void) => () => void;
    onPrivateMessage: (callback: (data: PrivateMessageEvent) => void) => () => void;
    onCourseSettingsUpdated: (callback: (data: CourseSettingsUpdatedEvent) => void) => () => void;
    onCourseMemberPromoted: (callback: (data: CourseMemberPromotedEvent) => void) => () => void;
    onCourseMemberDemoted: (callback: (data: CourseMemberDemotedEvent) => void) => () => void;
};

const SocketProviderCtx = createContext<SocketProviderProps>({} as SocketProviderProps);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { notify } = useNotificationProvider();
    const router = useRouter();
    const { data: session } = useSession();

    const [isConnected, setIsConnected] = useState(false);
    const [id, setId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const currentUserId = (session?.user as any)?.id;

    // Connection handlers
    const onConnect = useCallback(() => {
        setIsConnected(true);
        setId(socket.id);
        console.log(`Connected to server with id: ${socket.id}`);
    }, []);

    const onDisconnect = useCallback(() => {
        setIsConnected(false);
        console.log('Disconnected from server');
    }, []);

    // Course event handlers
    const handleCourseCreated = useCallback((data: CourseCreatedEvent) => {
        console.log('Course created:', data);
        notify('New course created!', { 
            type: 'success', 
            icon: BookOpen,
            description: data.name 
        });
        router.refresh();
    }, [notify, router]);

    const handleCourseMemberJoin = useCallback((data: CourseMemberEvent) => {
        console.log('Member joined course:', data);
        if (data.member?.user?.id !== currentUserId) {
            const userName = data.member?.user ? `${data.member.user.first_name} ${data.member.user.last_name}` : 'Someone';
            notify(`${userName} joined the course`, { 
                type: 'info', 
                icon: UserPlus,
                description: data.course?.name 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    const handleCourseMemberLeave = useCallback((data: CourseMemberActionEvent) => {
        console.log('Member left course:', data);
        if (data.userId === currentUserId) {
            notify('You left the course', { 
                type: 'info', 
                icon: UserMinus 
            });
            router.push('/dashboard');
        } else {
            notify('A member left the course', { 
                type: 'info', 
                icon: UserMinus 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    const handleCourseMemberApproved = useCallback((data: CourseMemberEvent) => {
        console.log('Member approved:', data);
        if (data.member?.user?.id === currentUserId) {
            notify('You have been approved!', { 
                type: 'success', 
                icon: CheckCircle,
                description: `You can now access ${data.course?.name}` 
            });
        } else {
            const userName = data.member?.user ? `${data.member.user.first_name} ${data.member.user.last_name}` : 'A member';
            notify(`${userName} was approved`, { 
                type: 'info', 
                icon: CheckCircle 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    const handleCourseMemberDeclined = useCallback((data: CourseMemberEvent) => {
        console.log('Member declined:', data);
        if (data.member?.user?.id === currentUserId) {
            notify('Your request was declined', { 
                type: 'warning', 
                icon: XCircle 
            });
        } else {
            const userName = data.member?.user ? `${data.member.user.first_name} ${data.member.user.last_name}` : 'A member';
            notify(`${userName} was declined`, { 
                type: 'info', 
                icon: XCircle 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    const handleCourseDeleted = useCallback((data: CourseDeletedEvent) => {
        console.log('Course deleted:', data);
        notify('A course was deleted', { 
            type: 'warning', 
            icon: BookOpen 
        });
        router.push('/dashboard');
        router.refresh();
    }, [notify, router]);

    // Post event handlers
    const handleNewPost = useCallback((data: PostCreatedEvent) => {
        console.log('New post created:', data);
        notify('New post created!', { 
            type: 'info', 
            icon: FileText,
            description: data.post?.name 
        });
        router.refresh();
    }, [notify, router]);

    // Submission event handlers
    const handleSubmissionCreated = useCallback((data: SubmissionEvent) => {
        console.log('Submission created:', data);
        if (data.submission?.student?.id !== currentUserId) {
            notify('New submission created', { 
                type: 'info', 
                icon: FileText 
            });
            router.refresh();
        }
    }, [notify, router, currentUserId]);

    const handleSubmissionSubmitted = useCallback((data: SubmissionEvent) => {
        console.log('Submission submitted:', data);
        if (data.submission?.student?.id === currentUserId) {
            notify('Submission submitted successfully!', { 
                type: 'success', 
                icon: CheckCircle 
            });
        } else {
            notify('A student submitted their work', { 
                type: 'info', 
                icon: CheckCircle 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    const handleSubmissionUnsubmitted = useCallback((data: SubmissionEvent) => {
        console.log('Submission unsubmitted:', data);
        if (data.submission?.student?.id === currentUserId) {
            notify('Submission withdrawn', { 
                type: 'info', 
                icon: XCircle 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    const handleSubmissionGraded = useCallback((data: SubmissionEvent) => {
        console.log('Submission graded:', data);
        if (data.submission?.student?.id === currentUserId) {
            notify('Your submission has been graded!', { 
                type: 'success', 
                icon: GraduationCap,
                description: `Score: ${data.submission?.score || 'N/A'}` 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    const handleSubmissionEdited = useCallback((data: SubmissionEvent) => {
        console.log('Submission edited:', data);
        if (data.submission?.student?.id !== currentUserId) {
            notify('A submission was updated', { 
                type: 'info', 
                icon: FileText 
            });
            router.refresh();
        }
    }, [notify, router, currentUserId]);

    // Comment event handlers
    const handleCommentCreated = useCallback((data: CommentCreatedEvent) => {
        console.log('Comment created:', data);
        notify('New comment added!', { 
            type: 'info', 
            icon: MessageCircle,
            description: data.post?.name 
        });
        router.refresh();
    }, [notify, router]);

    // Private message event handlers
    const handlePrivateMessage = useCallback((data: PrivateMessageEvent) => {
        console.log('Private message received:', data);
        notify('New message received!', { 
            type: 'info', 
            icon: MessageCircle 
        });
    }, [notify]);

    // Course settings event handlers
    const handleCourseSettingsUpdated = useCallback((data: CourseSettingsUpdatedEvent) => {
        console.log('Course settings updated:', data);
        notify('Course settings have been updated', { 
            type: 'info', 
            icon: Settings,
            description: data.course?.name 
        });
        router.refresh();
    }, [notify, router]);

    // Course member promotion event handlers
    const handleCourseMemberPromoted = useCallback((data: CourseMemberPromotedEvent) => {
        console.log('Member promoted:', data);
        if (data.member?.user?.id === currentUserId) {
            notify('You have been promoted to teacher!', { 
                type: 'success', 
                icon: Shield,
                description: data.course?.name 
            });
        } else {
            const userName = data.member?.user ? `${data.member.user.first_name} ${data.member.user.last_name}` : 'A member';
            notify(`${userName} was promoted to teacher`, { 
                type: 'info', 
                icon: Shield 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    // Course member demotion event handlers
    const handleCourseMemberDemoted = useCallback((data: CourseMemberDemotedEvent) => {
        console.log('Member demoted:', data);
        if (data.member?.user?.id === currentUserId) {
            notify('You have been demoted to student', { 
                type: 'warning', 
                icon: Shield,
                description: data.course?.name 
            });
        } else {
            const userName = data.member?.user ? `${data.member.user.first_name} ${data.member.user.last_name}` : 'A member';
            notify(`${userName} was demoted to student`, { 
                type: 'info', 
                icon: Shield 
            });
        }
        router.refresh();
    }, [notify, router, currentUserId]);

    // Setup event listeners
    useEffect(() => {
        if (socket.connected && !isConnected) {
            onConnect();
        }

        // Connection events
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Course events
        socket.on('course-created', handleCourseCreated);
        socket.on('course-member-join', handleCourseMemberJoin);
        socket.on('course-member-leave', handleCourseMemberLeave);
        socket.on('course-member-approved', handleCourseMemberApproved);
        socket.on('course-member-declined', handleCourseMemberDeclined);
        socket.on('course-deleted', handleCourseDeleted);

        // Post events
        socket.on('new-post', handleNewPost);
        socket.on('comment-created', handleCommentCreated);

        // Message events
        socket.on('private-message', handlePrivateMessage);

        // Course settings events
        socket.on('course-settings-updated', handleCourseSettingsUpdated);

        // Course member events
        socket.on('course-member-promoted', handleCourseMemberPromoted);
        socket.on('course-member-demoted', handleCourseMemberDemoted);

        // Submission events
        socket.on('submission-created', handleSubmissionCreated);
        socket.on('submission-submitted', handleSubmissionSubmitted);
        socket.on('submission-unsubmitted', handleSubmissionUnsubmitted);
        socket.on('submission-graded', handleSubmissionGraded);
        socket.on('submission-edited', handleSubmissionEdited);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('course-created', handleCourseCreated);
            socket.off('course-member-join', handleCourseMemberJoin);
            socket.off('course-member-leave', handleCourseMemberLeave);
            socket.off('course-member-approved', handleCourseMemberApproved);
            socket.off('course-member-declined', handleCourseMemberDeclined);
            socket.off('course-deleted', handleCourseDeleted);
            socket.off('new-post', handleNewPost);
            socket.off('comment-created', handleCommentCreated);
            socket.off('private-message', handlePrivateMessage);
            socket.off('course-settings-updated', handleCourseSettingsUpdated);
            socket.off('course-member-promoted', handleCourseMemberPromoted);
            socket.off('course-member-demoted', handleCourseMemberDemoted);
            socket.off('submission-created', handleSubmissionCreated);
            socket.off('submission-submitted', handleSubmissionSubmitted);
            socket.off('submission-unsubmitted', handleSubmissionUnsubmitted);
            socket.off('submission-graded', handleSubmissionGraded);
            socket.off('submission-edited', handleSubmissionEdited);
        };
    }, [
        isConnected, 
        onConnect, 
        onDisconnect,
        handleCourseCreated,
        handleCourseMemberJoin,
        handleCourseMemberLeave,
        handleCourseMemberApproved,
        handleCourseMemberDeclined,
        handleCourseDeleted,
        handleNewPost,
        handleCommentCreated,
        handlePrivateMessage,
        handleCourseSettingsUpdated,
        handleCourseMemberPromoted,
        handleCourseMemberDemoted,
        handleSubmissionCreated,
        handleSubmissionSubmitted,
        handleSubmissionUnsubmitted,
        handleSubmissionGraded,
        handleSubmissionEdited
    ]);

    // Custom event subscription methods for components
    const onCourseCreated = useCallback((callback: (data: CourseCreatedEvent) => void) => {
        socket.on('course-created', callback);
        return () => socket.off('course-created', callback);
    }, []);

    const onCourseMemberJoin = useCallback((callback: (data: CourseMemberEvent) => void) => {
        socket.on('course-member-join', callback);
        return () => socket.off('course-member-join', callback);
    }, []);

    const onCourseMemberLeave = useCallback((callback: (data: CourseMemberActionEvent) => void) => {
        socket.on('course-member-leave', callback);
        return () => socket.off('course-member-leave', callback);
    }, []);

    const onCourseMemberApproved = useCallback((callback: (data: CourseMemberEvent) => void) => {
        socket.on('course-member-approved', callback);
        return () => socket.off('course-member-approved', callback);
    }, []);

    const onCourseMemberDeclined = useCallback((callback: (data: CourseMemberEvent) => void) => {
        socket.on('course-member-declined', callback);
        return () => socket.off('course-member-declined', callback);
    }, []);

    const onCourseDeleted = useCallback((callback: (data: CourseDeletedEvent) => void) => {
        socket.on('course-deleted', callback);
        return () => socket.off('course-deleted', callback);
    }, []);

    const onNewPost = useCallback((callback: (data: PostCreatedEvent) => void) => {
        socket.on('new-post', callback);
        return () => socket.off('new-post', callback);
    }, []);

    const onSubmissionCreated = useCallback((callback: (data: SubmissionEvent) => void) => {
        socket.on('submission-created', callback);
        return () => socket.off('submission-created', callback);
    }, []);

    const onSubmissionSubmitted = useCallback((callback: (data: SubmissionEvent) => void) => {
        socket.on('submission-submitted', callback);
        return () => socket.off('submission-submitted', callback);
    }, []);

    const onSubmissionUnsubmitted = useCallback((callback: (data: SubmissionEvent) => void) => {
        socket.on('submission-unsubmitted', callback);
        return () => socket.off('submission-unsubmitted', callback);
    }, []);

    const onSubmissionGraded = useCallback((callback: (data: SubmissionEvent) => void) => {
        socket.on('submission-graded', callback);
        return () => socket.off('submission-graded', callback);
    }, []);

    const onSubmissionEdited = useCallback((callback: (data: SubmissionEvent) => void) => {
        socket.on('submission-edited', callback);
        return () => socket.off('submission-edited', callback);
    }, []);

    const onCommentCreated = useCallback((callback: (data: CommentCreatedEvent) => void) => {
        socket.on('comment-created', callback);
        return () => socket.off('comment-created', callback);
    }, []);

    const onPrivateMessage = useCallback((callback: (data: PrivateMessageEvent) => void) => {
        socket.on('private-message', callback);
        return () => socket.off('private-message', callback);
    }, []);

    const onCourseSettingsUpdated = useCallback((callback: (data: CourseSettingsUpdatedEvent) => void) => {
        socket.on('course-settings-updated', callback);
        return () => socket.off('course-settings-updated', callback);
    }, []);

    const onCourseMemberPromoted = useCallback((callback: (data: CourseMemberPromotedEvent) => void) => {
        socket.on('course-member-promoted', callback);
        return () => socket.off('course-member-promoted', callback);
    }, []);

    const onCourseMemberDemoted = useCallback((callback: (data: CourseMemberDemotedEvent) => void) => {
        socket.on('course-member-demoted', callback);
        return () => socket.off('course-member-demoted', callback);
    }, []);

    return (
        <SocketProviderCtx.Provider
            value={{
                socket,
                isConnected,
                id,
                isLoading,
                setIsLoading,
                onCourseCreated,
                onCourseMemberJoin,
                onCourseMemberLeave,
                onCourseMemberApproved,
                onCourseMemberDeclined,
                onCourseDeleted,
                onNewPost,
                onSubmissionCreated,
                onSubmissionSubmitted,
                onSubmissionUnsubmitted,
                onSubmissionGraded,
                onSubmissionEdited,
                onCommentCreated,
                onPrivateMessage,
                onCourseSettingsUpdated,
                onCourseMemberPromoted,
                onCourseMemberDemoted,
            }}
        >
            {children}
        </SocketProviderCtx.Provider>
    );
};

export const useSocket = () => useContext(SocketProviderCtx);
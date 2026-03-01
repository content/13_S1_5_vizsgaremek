import { useEffect } from 'react';
import { useSocket } from '@/components/socket-provider';

/**
 * Custom hooks for subscribing to specific websocket events in components.
 * These hooks automatically handle cleanup when the component unmounts.
 */

/**
 * Listen for course creation events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useCourseCreated = (
    onEvent: (data: { id: number; name: string; invitationCode: string }) => void,
    deps: any[] = []
) => {
    const { onCourseCreated } = useSocket();

    useEffect(() => {
        const unsubscribe = onCourseCreated(onEvent);
        return unsubscribe;
    }, [onCourseCreated, ...deps]);
};

/**
 * Listen for course member join events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useCourseMemberJoin = (
    onEvent: (data: any) => void,
    deps: any[] = []
) => {
    const { onCourseMemberJoin } = useSocket();

    useEffect(() => {
        const unsubscribe = onCourseMemberJoin(onEvent);
        return unsubscribe;
    }, [onCourseMemberJoin, ...deps]);
};

/**
 * Listen for course member leave events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useCourseMemberLeave = (
    onEvent: (data: { courseId: number; userId: number }) => void,
    deps: any[] = []
) => {
    const { onCourseMemberLeave } = useSocket();

    useEffect(() => {
        const unsubscribe = onCourseMemberLeave(onEvent);
        return unsubscribe;
    }, [onCourseMemberLeave, ...deps]);
};

/**
 * Listen for course member approved events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useCourseMemberApproved = (
    onEvent: (data: any) => void,
    deps: any[] = []
) => {
    const { onCourseMemberApproved } = useSocket();

    useEffect(() => {
        const unsubscribe = onCourseMemberApproved(onEvent);
        return unsubscribe;
    }, [onCourseMemberApproved, ...deps]);
};

/**
 * Listen for course member declined events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useCourseMemberDeclined = (
    onEvent: (data: any) => void,
    deps: any[] = []
) => {
    const { onCourseMemberDeclined } = useSocket();

    useEffect(() => {
        const unsubscribe = onCourseMemberDeclined(onEvent);
        return unsubscribe;
    }, [onCourseMemberDeclined, ...deps]);
};

/**
 * Listen for course deleted events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useCourseDeleted = (
    onEvent: (data: { courseId: number }) => void,
    deps: any[] = []
) => {
    const { onCourseDeleted } = useSocket();

    useEffect(() => {
        const unsubscribe = onCourseDeleted(onEvent);
        return unsubscribe;
    }, [onCourseDeleted, ...deps]);
};

/**
 * Listen for new post events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useNewPost = (
    onEvent: (data: { post: any; courseId: number }) => void,
    deps: any[] = []
) => {
    const { onNewPost } = useSocket();

    useEffect(() => {
        const unsubscribe = onNewPost(onEvent);
        return unsubscribe;
    }, [onNewPost, ...deps]);
};

/**
 * Listen for submission created events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useSubmissionCreated = (
    onEvent: (data: { submission: any; postId: number; courseId: number }) => void,
    deps: any[] = []
) => {
    const { onSubmissionCreated } = useSocket();

    useEffect(() => {
        const unsubscribe = onSubmissionCreated(onEvent);
        return unsubscribe;
    }, [onSubmissionCreated, ...deps]);
};

/**
 * Listen for submission submitted events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useSubmissionSubmitted = (
    onEvent: (data: { submission: any; postId: number; courseId: number }) => void,
    deps: any[] = []
) => {
    const { onSubmissionSubmitted } = useSocket();

    useEffect(() => {
        const unsubscribe = onSubmissionSubmitted(onEvent);
        return unsubscribe;
    }, [onSubmissionSubmitted, ...deps]);
};

/**
 * Listen for submission unsubmitted events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useSubmissionUnsubmitted = (
    onEvent: (data: { submission: any; postId: number; courseId: number }) => void,
    deps: any[] = []
) => {
    const { onSubmissionUnsubmitted } = useSocket();

    useEffect(() => {
        const unsubscribe = onSubmissionUnsubmitted(onEvent);
        return unsubscribe;
    }, [onSubmissionUnsubmitted, ...deps]);
};

/**
 * Listen for submission graded events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useSubmissionGraded = (
    onEvent: (data: { submission: any; postId: number; courseId: number }) => void,
    deps: any[] = []
) => {
    const { onSubmissionGraded } = useSocket();

    useEffect(() => {
        const unsubscribe = onSubmissionGraded(onEvent);
        return unsubscribe;
    }, [onSubmissionGraded, ...deps]);
};

/**
 * Listen for submission edited events
 * @param onEvent Callback function to handle the event
 * @param deps Dependency array for the callback
 */
export const useSubmissionEdited = (
    onEvent: (data: { submission: any; postId: number; courseId: number }) => void,
    deps: any[] = []
) => {
    const { onSubmissionEdited } = useSocket();

    useEffect(() => {
        const unsubscribe = onSubmissionEdited(onEvent);
        return unsubscribe;
    }, [onSubmissionEdited, ...deps]);
};

/**
 * Listen for all course-related events
 * @param callbacks Object containing callback functions for different course events
 */
export const useCourseEvents = (callbacks: {
    onCreated?: (data: any) => void;
    onMemberJoin?: (data: any) => void;
    onMemberLeave?: (data: any) => void;
    onMemberApproved?: (data: any) => void;
    onMemberDeclined?: (data: any) => void;
    onDeleted?: (data: any) => void;
}) => {
    if (callbacks.onCreated) useCourseCreated(callbacks.onCreated);
    if (callbacks.onMemberJoin) useCourseMemberJoin(callbacks.onMemberJoin);
    if (callbacks.onMemberLeave) useCourseMemberLeave(callbacks.onMemberLeave);
    if (callbacks.onMemberApproved) useCourseMemberApproved(callbacks.onMemberApproved);
    if (callbacks.onMemberDeclined) useCourseMemberDeclined(callbacks.onMemberDeclined);
    if (callbacks.onDeleted) useCourseDeleted(callbacks.onDeleted);
};

/**
 * Listen for all submission-related events
 * @param callbacks Object containing callback functions for different submission events
 */
export const useSubmissionEvents = (callbacks: {
    onCreated?: (data: any) => void;
    onSubmitted?: (data: any) => void;
    onUnsubmitted?: (data: any) => void;
    onGraded?: (data: any) => void;
    onEdited?: (data: any) => void;
}) => {
    if (callbacks.onCreated) useSubmissionCreated(callbacks.onCreated);
    if (callbacks.onSubmitted) useSubmissionSubmitted(callbacks.onSubmitted);
    if (callbacks.onUnsubmitted) useSubmissionUnsubmitted(callbacks.onUnsubmitted);
    if (callbacks.onGraded) useSubmissionGraded(callbacks.onGraded);
    if (callbacks.onEdited) useSubmissionEdited(callbacks.onEdited);
};

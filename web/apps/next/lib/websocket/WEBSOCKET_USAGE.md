# Websocket Event Handler Usage Guide

This guide explains how to use the websocket event handlers in your components.

## Basic Usage

### Using the Socket Provider Context

```tsx
import { useSocket } from '@/components/socket-provider';

function MyComponent() {
    const { isConnected, socket } = useSocket();

    return (
        <div>
            {isConnected ? 'Connected' : 'Disconnected'}
        </div>
    );
}
```

## Using Custom Hooks

### Single Event Listener

```tsx
import { useNewPost } from '@/hooks/use-websocket-events';
import { useRouter } from 'next/navigation';

function CourseComponent() {
    const router = useRouter();

    useNewPost((data) => {
        console.log('New post created:', data.post);
        // Refresh the page to show the new post
        router.refresh();
    });

    return <div>Course Content</div>;
}
```

### Multiple Event Listeners

```tsx
import { 
    useCourseMemberJoin, 
    useCourseMemberLeave,
    useNewPost 
} from '@/hooks/use-websocket-events';

function CourseDetailPage({ courseId }: { courseId: number }) {
    const [members, setMembers] = useState([]);

    useCourseMemberJoin((data) => {
        if (data.course.id === courseId) {
            console.log('New member joined:', data.member);
            // Update local state
            setMembers(prev => [...prev, data.member]);
        }
    });

    useCourseMemberLeave((data) => {
        if (data.courseId === courseId) {
            console.log('Member left:', data.userId);
            // Update local state
            setMembers(prev => prev.filter(m => m.user.id !== data.userId));
        }
    });

    useNewPost((data) => {
        if (data.courseId === courseId) {
            console.log('New post in this course:', data.post);
        }
    });

    return <div>Course Page</div>;
}
```

### Using Grouped Event Hooks

```tsx
import { useCourseEvents } from '@/hooks/use-websocket-events';

function CourseManagementComponent() {
    useCourseEvents({
        onMemberJoin: (data) => {
            console.log('Member joined:', data);
        },
        onMemberLeave: (data) => {
            console.log('Member left:', data);
        },
        onDeleted: (data) => {
            console.log('Course deleted:', data);
            // Redirect to dashboard
        }
    });

    return <div>Course Management</div>;
}
```

### Submission Events

```tsx
import { useSubmissionEvents } from '@/hooks/use-websocket-events';
import { useSession } from 'next-auth/react';

function SubmissionPage({ postId }: { postId: number }) {
    const { data: session } = useSession();
    const currentUserId = (session?.user as any)?.id;

    useSubmissionEvents({
        onSubmitted: (data) => {
            if (data.postId === postId) {
                console.log('Submission submitted:', data.submission);
            }
        },
        onGraded: (data) => {
            if (data.submission.user.id === currentUserId) {
                // Show notification - already handled by socket provider
                console.log('Your submission was graded!');
            }
        },
        onCreated: (data) => {
            if (data.postId === postId) {
                console.log('New submission created');
            }
        }
    });

    return <div>Submission Page</div>;
}
```

## Direct Socket Access

For advanced use cases, you can access the socket directly:

```tsx
import { useSocket } from '@/components/socket-provider';

function AdvancedComponent() {
    const { socket } = useSocket();

    const sendCustomEvent = () => {
        socket?.emit('custom-event', { data: 'example' });
    };

    return (
        <button onClick={sendCustomEvent}>
            Send Custom Event
        </button>
    );
}
```

## Available Events

### Course Events
- `course-created` - When a new course is created
- `course-member-join` - When a member joins a course
- `course-member-leave` - When a member leaves a course
- `course-member-approved` - When a pending member is approved
- `course-member-declined` - When a pending member is declined
- `course-deleted` - When a course is deleted

### Post Events
- `new-post` - When a new post is created in a course

### Submission Events
- `submission-created` - When a submission is created
- `submission-submitted` - When a submission is submitted
- `submission-unsubmitted` - When a submission is withdrawn
- `submission-graded` - When a submission is graded
- `submission-edited` - When a submission is edited

## Notes

- All events are automatically handled by the socket provider with notifications and page refreshes
- Custom hooks allow you to add additional behavior beyond the default handlers
- The socket provider automatically cleans up event listeners when components unmount
- User-specific notifications (like "You were approved") are only shown to the relevant user

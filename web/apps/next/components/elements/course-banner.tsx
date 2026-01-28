import { generateColorFromInvitationCode } from '@/lib/dashboard/utils';
import { Course, CourseMember } from '@studify/types';
import Image from 'next/image';

type CourseBannerProps = {
    course: Course;
}

export default function CourseBanner({ course }: CourseBannerProps) {
    const colors = generateColorFromInvitationCode(course.invitationCode);

    const teacherNames = course.members.filter((m: CourseMember) => m.isTeacher).map((t: CourseMember) => `${t.user.first_name} ${t.user.last_name}`);

    return (
        <div className="relative h-48 md:h-64 lg:h-64 2xl:h-64 mb-6 shadow-md rounded-lg overflow-hidden">
            {course.backgroundImage ? (
                <Image src={course.backgroundImage.path} alt={`${course.name} background`} fill className="absolute object-cover z-1" />
            ) : (
                <div className={`${colors.bg} absolute overflow-hidden rounded-lg w-full h-full z-1`} />
            )}
            <div className="relative max-w-6xl mx-auto z-10 p-6 md:py-8 ">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 max-w-2xl">{course?.name}</h1>
                <p className="text-white/90 text-sm md:text-base">{teacherNames.join(", ")}</p>
            </div>
        </div>
    )
}
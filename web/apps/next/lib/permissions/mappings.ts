/**
 * Permission keys that can be set at the course level
 */
export const PERMISSION_KEYS = {
    ALLOW_COMMENTS: "allowComments",
    SHOW_INVITE_CODE: "showInviteCode",
    STUDENTS_CAN_CREATE_POSTS: "studentsCanCreatePosts",
    AUTO_APPROVE_MEMBERS: "autoApproveMembers",
    AUTO_REJECT_MEMBERS: "autoRejectMembers",
} as const;

/**
 * Default permission values for a new course
 */
export const DEFAULT_PERMISSIONS = {
    allowComments: true,
    showInviteCode: true,
    studentsCanCreatePosts: false,
    autoApproveMembers: false,
    autoRejectMembers: false,
    allowedStudentPostTypes: [] as number[],
} as const;

export type CoursePermissions = typeof DEFAULT_PERMISSIONS;

const mappings = {
    allowComments: {
        label: "Hozzászólások engedélyezése",
        description: "Az új bejegyzéseknél alapértelmezetten engedélyezve lesznek a hozzászólások.",
    },
    showInviteCode: {
        label: "Meghívó kód megjelenítése",
        description: "A kurzus meghívókódja látható a tanulók számára.",
    },
    studentsCanCreatePosts: {
        label: "Tanulói bejegyzések",
        description: "Engedélyezi a tanulóknak, hogy új bejegyzéseket hozzanak létre.",
    },
    autoApproveMembers: {
        label: "Automatikus jóváhagyás",
        description: "Az új jelentkezők azonnal csatlakoznak a kurzushoz.",
    },
    autoRejectMembers: {
        label: "Automatikus elutasítás",
        description: "Az új jelentkezők automatikusan elutasításra kerülnek.",
    },
} as const;

export default mappings;
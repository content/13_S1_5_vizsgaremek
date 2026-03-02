import { CoursePermissions, DEFAULT_PERMISSIONS } from "./mappings";

/**
 * Check if a user has a specific permission in a course
 * @param userPermissions - The user's course permissions object
 * @param permission - The permission key to check
 * @returns boolean indicating if the user has the permission
 */
export function hasPermission(
    userPermissions: CoursePermissions,
    permission: keyof Omit<CoursePermissions, "allowedStudentPostTypes">
): boolean {
    return (userPermissions[permission] as boolean) ?? false;
}

/**
 * Check if a student can create a specific post type
 * @param userPermissions - The user's course permissions object
 * @param postTypeId - The post type ID to check
 * @returns boolean indicating if the post type is allowed
 */
export function canCreatePostType(userPermissions: CoursePermissions, postTypeId: number): boolean {
    if (!userPermissions.studentsCanCreatePosts) {
        return false;
    }

    // If no types are restricted, all are allowed
    if (userPermissions.allowedStudentPostTypes.length === 0) {
        return true;
    }

    return userPermissions.allowedStudentPostTypes.includes(postTypeId);
}

/**
 * Merge user permissions with default permissions
 * Useful when updating permissions to ensure all fields are present
 * @param permissions - Partial permissions object
 * @returns Complete permissions object with defaults for missing keys
 */
export function mergePermissions(permissions: Partial<CoursePermissions>): CoursePermissions {
    return {
        ...DEFAULT_PERMISSIONS,
        ...permissions,
    };
}

/**
 * Validate that permissions object has all required fields
 * @param permissions - Permissions object to validate
 * @returns object with validation result and any error messages
 */
export function validatePermissions(
    permissions: Partial<CoursePermissions>
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
        permissions.autoApproveMembers &&
        permissions.autoRejectMembers
    ) {
        errors.push("Az automatikus jóváhagyás és elutasítás nem lehet egyszerre engedélyezve.");
    }

    if (!Array.isArray(permissions.allowedStudentPostTypes)) {
        errors.push("Az engedélyezett bejegyzés típusoknak tömbnek kell lennie.");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}